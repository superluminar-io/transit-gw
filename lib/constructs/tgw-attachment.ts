import { aws_ec2 as ec2, IResource, Resource, Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ITransitGateway } from './transit-gateway';

export interface TgwAttachmentProps {
    /**
     * Optional subnet selection
     *
     * @default ec2.SubnetType.PRIVATE_ISOLATED
     */
    readonly subnets?: ec2.SubnetSelection;

    /**
     * The transit gateway to attach
     */
    readonly transitGateway: ITransitGateway;

    /**
     * The VPC to attach the transit gateway to
     */
    readonly vpc: ec2.IVpc;

    /**
     * The name of the attachment
     *
     * @default generated
     */
    readonly name?: string;
}

export interface ITransitGatewayAttachment extends IResource {
    readonly transitGatewayAttachmentId: string;
    readonly transitGatewayId: string;
    readonly attachment: ec2.CfnTransitGatewayAttachment;
}

abstract class TransitGatewayAttachmentBase extends Resource implements ITransitGatewayAttachment {
    public abstract readonly transitGatewayAttachmentId: string;
    public abstract readonly transitGatewayId: string;
    public abstract readonly attachment: ec2.CfnTransitGatewayAttachment;
}

export interface TransitGatewayAttachmentAttributes {
    readonly transitGatewayId: string;
    readonly transitGatewayAttachmentId: string;
}

export class TransitGatewayAttachment extends TransitGatewayAttachmentBase {
    static fromTransitGatewayAttachmentAttributes(
        scope: Construct, id: string, attrs: TransitGatewayAttachmentAttributes,
    ): ITransitGatewayAttachment {
        class Import extends TransitGatewayAttachmentBase {
            public transitGatewayAttachmentId = attrs.transitGatewayAttachmentId;
            public transitGatewayId = attrs.transitGatewayId;
            attachment: ec2.CfnTransitGatewayAttachment;
        }

        return new Import(scope, id);
    }

    readonly attachment: ec2.CfnTransitGatewayAttachment;

    get transitGatewayAttachmentId(): string {
        return this.attachment.ref;
    }

    transitGatewayId: string;

    constructor(scope: Construct, id: string, props: TgwAttachmentProps) {
        super(scope, id);
        this.attachment = new ec2.CfnTransitGatewayAttachment(this, 'TgwAttachment', {
            vpcId: props.vpc.vpcId,
            transitGatewayId: props.transitGateway.transitGatewayId,
            subnetIds: props.subnets ?
                props.vpc.selectSubnets(props.subnets).subnetIds :
                props.vpc.selectSubnets({
                    subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
                }).subnetIds,
            tags: [{
                key: 'Name',
                value: props.name ?? `${Stack.of(this).stackName}`,
            }],
        });
        this.transitGatewayId = props.transitGateway.transitGatewayId;
    }
}