import { aws_ec2 as ec2, Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ITransitGatewayAttachment } from './tgw-attachment';
import { ITransitGateway } from './transit-gateway';

export interface TgwRouteTableProps {
    readonly transitGateway: ITransitGateway;
    readonly name?: string;
}
export class TgwRouteTable extends Construct {
    private routeTable: ec2.CfnTransitGatewayRouteTable;

    get routeTableId(): string {
        return this.routeTable.ref;
    }

    constructor(scope: Construct, id: string, props: TgwRouteTableProps) {
        super(scope, id);
        this.routeTable = new ec2.CfnTransitGatewayRouteTable(this, 'Default', {
            transitGatewayId: props.transitGateway.transitGatewayId,
            tags: [{
                key: 'Name',
                value: props.name ?? `${Stack.of(this).stackName}-RouteTable`,
            }],
        });
    }

    public addAssociation(transitGatewayAttachment: ITransitGatewayAttachment) {
        new ec2.CfnTransitGatewayRouteTableAssociation(this, `Association/${transitGatewayAttachment.transitGatewayAttachmentId}`, {
            transitGatewayRouteTableId: this.routeTableId,
            transitGatewayAttachmentId: transitGatewayAttachment.transitGatewayAttachmentId,
        });
    }

    public addPropagation(transitGatewayAttachment: ITransitGatewayAttachment) {
        new ec2.CfnTransitGatewayRouteTablePropagation(this, `Propagation${transitGatewayAttachment.transitGatewayAttachmentId}`, {
            transitGatewayAttachmentId: transitGatewayAttachment.transitGatewayAttachmentId,
            transitGatewayRouteTableId: this.routeTableId,
        });
    }
}