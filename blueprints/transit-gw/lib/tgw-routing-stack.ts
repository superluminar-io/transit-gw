import { Stack, StackProps } from "aws-cdk-lib";
import { EC2Client, DescribeTransitGatewayVpcAttachmentsCommand } from "@aws-sdk/client-ec2";
import type { AssertiveClient } from "@smithy/types";
import { Construct } from 'constructs';
import { TgwRouteTable } from "./constructs/tgw-route-table";
import { ITransitGateway, SharedTransitGateway } from "./constructs/transit-gateway";
import { ITransitGatewayAttachment, TransitGatewayAttachment } from "./constructs/tgw-attachment";
import { config } from '../config';


export interface TgwRoutingStackProps extends StackProps {
    readonly tgwId: string;
}

export class TgwRoutingStack extends Stack {
    tgw: ITransitGateway;
    attachments: Record<string, ITransitGatewayAttachment> = {};

    constructor(scope: Construct, id: string, props: TgwRoutingStackProps) {
        super(scope, id, props);

        this.tgw = SharedTransitGateway.fromTransitGatewayId(this, 'SharedTransitGateway', props.tgwId);

        // Create route tables
        const routeTables: Record<string, TgwRouteTable> = {};
        config.routeTableNames.forEach((rtName) => {
            routeTables[rtName] = new TgwRouteTable(this, `Rt${rtName}`, {
                name: `${config.transitGatewayName}/${rtName}`,
                transitGateway: this.tgw,
            });
        });

        (async () => {
            // Get TGW attachments
            const ec2Client = new EC2Client({ region: this.region }) as AssertiveClient<EC2Client>;
            const response = await ec2Client.send(
                new DescribeTransitGatewayVpcAttachmentsCommand({
                    Filters: [
                        { Name: "transit-gateway-id", Values: [props.tgwId] },
                        { Name: "state", Values: ["available"] },
                    ],
                    MaxResults: 1000,
                })
            );
            if (response.TransitGatewayVpcAttachments === undefined) {
                return;
            }
            const tgwVpcAttachments = response.TransitGatewayVpcAttachments;

            // Create route table associations and propagations
            config.attachments.forEach((attachment) => {
                const attachmentId = tgwVpcAttachments.find(
                    (a) => a.VpcId === attachment.vpcId
                )?.TransitGatewayAttachmentId;
                if (!attachmentId) {
                    return;
                }

                // Create route table association
                if (attachment.tgwAssociationRouteTableName) {
                    if (!routeTables[attachment.tgwAssociationRouteTableName]) {
                        throw new Error(`Route table '${attachment.tgwAssociationRouteTableName}' not provided!`);
                    }
                    routeTables[attachment.tgwAssociationRouteTableName].addAssociation(
                        this.forAttachment(attachmentId)
                    );
                }

                // Create route table propagations
                if (attachment.tgwPropagationRouteTableNames) {
                    attachment.tgwPropagationRouteTableNames.forEach((rtName) => {
                        if (!routeTables[rtName]) {
                            throw new Error(`Route table '${rtName}' not provided!`);
                        }
                        routeTables[rtName].addPropagation(this.forAttachment(attachmentId));
                    });
                }
            });
        })();
    }

    forAttachment(attachmentId: string): ITransitGatewayAttachment {
        if (!this.attachments[attachmentId]) {
            this.attachments[attachmentId] = TransitGatewayAttachment.fromTransitGatewayAttachmentAttributes(
                this, `TGWA${attachmentId}`, {
                    transitGatewayAttachmentId: attachmentId, transitGatewayId: this.tgw.transitGatewayId
                }
            );
        }
        return this.attachments[attachmentId];
    };
}
