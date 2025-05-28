import { aws_ec2 as ec2, Stack, StackProps, Tags } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { SharedTransitGateway } from './constructs/transit-gateway';
import { AttachmentSubnetProps, config } from '../config';


export interface TgwAttachmentStackProperties extends StackProps {
    vpcId: string;
    tgwId: string;
}

const isSubnetSelection = (s: ec2.SubnetSelection | AttachmentSubnetProps[]): s is ec2.SubnetSelection => !(s instanceof Array);

export class TgwAttachmentStack extends Stack {
    constructor(scope: Construct, id: string, props: TgwAttachmentStackProperties) {
        super(scope, id, props);

        const transitGateway = SharedTransitGateway.fromTransitGatewayId(
            this, 'SharedTransitGateway', props.tgwId
        );

        const attachmentConfig = config.attachments.find(a => a.accountId === this.account && a.vpcId === props.vpcId)!;

        let attachmentSubnets: ec2.SubnetSelection | undefined = undefined;
        if (attachmentConfig.createAttachmentSubnets) {
            attachmentSubnets = {
                subnets: attachmentConfig.createAttachmentSubnets.map(subnetProps => {
                    const subnet = new ec2.PrivateSubnet(this, `TgwSubnet/${subnetProps.cidrBlock}`, {
                        vpcId: props.vpcId,
                        availabilityZone: subnetProps.availabilityZone,
                        cidrBlock: subnetProps.cidrBlock,
                    });
                    Tags.of(subnet).add('Name', `${config.transitGatewayName}/${subnetProps.availabilityZone}`);
                    return subnet;
                })
            };
        } else if (attachmentConfig.attachmentSubnetSelection) {
            if (attachmentConfig.attachmentSubnetSelection.subnetFilters) {
                attachmentSubnets = attachmentConfig.attachmentSubnetSelection;
                attachmentSubnets.subnetFilters!.push(ec2.SubnetFilter.onePerAz());
            } else {
                attachmentSubnets = {
                    ...attachmentConfig.attachmentSubnetSelection,
                    subnetFilters: [ec2.SubnetFilter.onePerAz()]
                };
            }
        }

        if (!attachmentSubnets) {
            console.log(`Skipping attachment for VPC ${props.vpcId}: No attachment subnets given.`);
            return;
        }

        const vpc = ec2.Vpc.fromLookup(this, 'Vpc', { vpcId: props.vpcId });
        try {
            if (vpc.selectSubnets(attachmentSubnets).subnets.length < 2) {
                console.log(`Skipping attachment for VPC ${props.vpcId}: Not enough subnets selected.`);
                return;
            }
        } catch (e) {
            if (e instanceof Error) {
                console.log(`Failed subnet selection: Skipping attachment for VPC ${props.vpcId}.`, e.message);
                return;
            }
        }
        const tgwAttachment = transitGateway.addVpcAttachment(vpc, attachmentSubnets);

        if (!attachmentConfig.propagationSubnetSelection) {
            return;
        }

        // collect unique route table ids for the tgw route propagation
        const routeTableIds = attachmentConfig.propagationSubnetSelection.map(
            s => {
                try {
                    return vpc.selectSubnets(s).subnets;
                } catch (e) {
                    return [];
                }
            }
        ).flat().map(
            s => s.routeTable.routeTableId
        ).filter((v, i, r) => r.indexOf(v) === i);

        routeTableIds.forEach(rtId => {
            config.attachmentPropagationCidrs.forEach((cidr, index) => {
                const route = new ec2.CfnRoute(this, `TgwRoute/${rtId}/Cidr-${cidr}`, {
                    routeTableId: rtId,
                    destinationCidrBlock: cidr,
                    transitGatewayId: transitGateway.transitGatewayId,
                });
                route.addDependency(tgwAttachment.attachment);
            });
        });
    }
}
