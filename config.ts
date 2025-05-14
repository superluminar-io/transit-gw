// Config file for the application

import { aws_ec2 as ec2 } from "aws-cdk-lib";

const byIds = (ids: string[]): ec2.SubnetSelection => ({ subnetFilters: [ec2.SubnetFilter.byIds(ids)] });

export interface AttachmentSubnetProps {
    readonly availabilityZone: string;
    readonly cidrBlock: string;
}

interface Attachment {
    accountId: string
    vpcId: string
    createAttachmentSubnets?: AttachmentSubnetProps[]
    attachmentSubnetSelection?: ec2.SubnetSelection
    propagationSubnetSelection?: ec2.SubnetSelection[]
    tgwAssociationRouteTableName?: string
    tgwPropagationRouteTableNames?: string[]
}

type Config = {
    organizationId: string
    transitGatewayAccountId: string
    transitGatewayId?: string
    transitGatewayName: string
    routeTableNames: string[]
    attachments: Attachment[]
    attachmentPropagationCidrs: string[]
}

export const config: Config = {
    organizationId: 'o-blikiivk10',
    transitGatewayAccountId: '763568475239',
    transitGatewayName: 'TGW-1',
    //transitGatewayId: 'tgw-089da5bd5b8cc0340',
    attachmentPropagationCidrs: ['10.0.0.0/8'],
    routeTableNames: ['default'], // ['default', 'private'],
    attachments: [
        {
            accountId: '241734811004',
            vpcId: 'vpc-0299d42bcde65caef',
            /* */
            createAttachmentSubnets: [
                { availabilityZone: 'eu-central-1a', cidrBlock: '10.2.6.32/28' },
                { availabilityZone: 'eu-central-1b', cidrBlock: '10.2.6.48/28' },
            ],
            /* */
            // attachmentSubnetSelection: byIds(['subnet-05921eda6411a1791', 'subnet-0ba1d51847e4ae497']),
            // attachmentSubnetSelection: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
            // attachmentSubnetSelection: { subnetGroupName: 'Application' },
            /* */
            propagationSubnetSelection: [
                byIds(['subnet-05921eda6411a1791', 'subnet-0ba1d51847e4ae497']),
            ],
            /* */
            // tgwAssociationRouteTableName: 'default',
            // tgwPropagationRouteTableNames: ['default'],
        },
        {
            accountId: '241734811004',
            vpcId: 'vpc-05552fc27818c033b',
            attachmentSubnetSelection: byIds(['subnet-03e807ec13410e8ce', 'subnet-067e0bf20c47bee23']),
            // tgwAssociationRouteTableName: 'default',
            // tgwPropagationRouteTableNames: ['default', 'private'],
        },
    ]
};
