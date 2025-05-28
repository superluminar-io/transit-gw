import { ArnFormat, aws_ec2 as ec2, aws_ram as ram, IResource, Resource, Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ITransitGatewayAttachment, TransitGatewayAttachment } from './tgw-attachment';

export interface TransitGatewayProps {
    /**
     * An optional name for the transit gateway
     */
    readonly name?: string;

    /**
     * The principals to share the transit gateway with
     */
    readonly shareToPrincipals: string[];

    /**
     * The name to use for the AWS Resource Access Managemer Share
     */
    readonly shareName: string;

    /**
     * Enable auto accept for shared attachments.
     *
     * @default false
     */
    readonly autoAcceptSharedAttachment?: boolean;
}

export interface ITransitGateway extends IResource {

    /**
     * The transit gateway id
     */
    readonly transitGatewayId: string;

    /**
     * The transit gateway arn
     */
    readonly transitGatewayArn: string;

    /**
     * Adds an attachement to the given VPC subnets
     *
     * @param {ec2.IVpc} vpc the vpc to attach to
     * @param {ec2.SubnetSelection} subnets the subnet selection for the subnets to attach to
     *
     * @returns ITransitGateway the transit gateway attachment
     */
    addVpcAttachment(vpc: ec2.IVpc, subnets: ec2.SubnetSelection): ITransitGatewayAttachment;
}

abstract class TransitGatewayBase extends Resource implements ITransitGateway {

    /**
     * Import an existing transit gateway by ARN.
     */
    static fromTransitGatewayArn(scope: Construct, id: string, transitGatewayArn: string): ITransitGateway {
        const parts = Stack.of(scope).splitArn(transitGatewayArn, ArnFormat.SLASH_RESOURCE_NAME);

        class Import extends TransitGatewayBase {
            readonly transitGatewayArn = transitGatewayArn;
            readonly transitGatewayId = parts.resourceName || '';
        }

        return new Import(scope, id);
    }

    /**
     * Import an existing transit gateway by ID.
     */
    static fromTransitGatewayId(scope: Construct, id: string, transitGatewayId: string): ITransitGateway {
        class Import extends TransitGatewayBase {
            readonly transitGatewayId = transitGatewayId;
            readonly transitGatewayArn = Stack.of(scope).formatArn({
                service: 'ec2',
                resource: 'transit-gateway',
                resourceName: transitGatewayId,
            });
        }

        return new Import(scope, id);
    }

    abstract readonly transitGatewayId: string;
    abstract readonly transitGatewayArn: string;

    addVpcAttachment(vpc: ec2.IVpc, subnets: ec2.SubnetSelection): ITransitGatewayAttachment {
        if (Stack.of(this).account != Stack.of(vpc).account) {
            throw new Error('The VPC attachment and the VPC should be in the same AWS account');
        }

        return new TransitGatewayAttachment(this, 'Attachment', {
            vpc: vpc,
            transitGateway: this,
            subnets: subnets,
        });
    }
}

/**
 * A transit gateway that is shared to the given principles via resource access manager.
 */
export class SharedTransitGateway extends TransitGatewayBase {

    /**
     * Save the CfnTransitGateway for usage in getters
     */
    private tgw: ec2.CfnTransitGateway;

    /**
     * Get the id ofthe transit gateway
     */
    get transitGatewayId(): string {
        return this.tgw.ref;
    }

    /**
     * Get the arn of the transit gateway
     */
    get transitGatewayArn(): string {
        return Stack.of(this).formatArn({
            service: 'ec2',
            resource: 'transit-gateway',
            resourceName: this.transitGatewayId,
        });
    }

    constructor(scope: Construct, id: string, props: TransitGatewayProps) {
        super(scope, id);
        const transitGateway = new ec2.CfnTransitGateway(this, 'Default', {
            autoAcceptSharedAttachments: props.autoAcceptSharedAttachment ? 'enable' : 'disable',
            tags: [{
                key: 'Name',
                value: props.name ?? `TGW - ${scope.node.id}-${id}`,
            }],
            defaultRouteTableAssociation: 'disable',
            defaultRouteTablePropagation: 'disable',
        });

        this.tgw = transitGateway;

        // Share the transit gateway with the principals provided
        new ram.CfnResourceShare(this, 'Share', {
            name: props.shareName ?? 'TGW-Share',
            allowExternalPrincipals: false,
            resourceArns: [
                this.transitGatewayArn,
            ],
            principals: props.shareToPrincipals,
        });
    }
}