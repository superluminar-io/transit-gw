import { App, DefaultStackSynthesizer } from 'aws-cdk-lib';
import { TgwAttachmentStack } from "../lib/tgw-attachment-stack";
import { config } from "../config";


const tgwId = config.transitGatewayId;
if (!tgwId) {
    console.log('No Transit Gateway ID found in config');
    process.exit();
}

const thisAccount = process.env.CDK_DEFAULT_ACCOUNT;

const app = new App();

config.attachments.forEach(attachment => {
    new TgwAttachmentStack(app, `TgwAttach/${config.transitGatewayName}/${attachment.vpcId}`, {
        env: { account: attachment.accountId, region: process.env.AWS_DEFAULT_REGION },
        synthesizer: new DefaultStackSynthesizer({
            fileAssetsBucketName: `cdk-tgw-attachment-assets-${thisAccount}-\${AWS::Region}`,
            bucketPrefix: `${config.transitGatewayName}/${attachment.accountId}/${attachment.vpcId}/`,

            lookupRoleArn: 'arn:${AWS::Partition}:iam::${AWS::AccountId}:role/tgw-attachment',
            deployRoleArn: 'arn:${AWS::Partition}:iam::${AWS::AccountId}:role/tgw-attachment',
            fileAssetPublishingRoleArn: `arn:\${AWS::Partition}:iam::${thisAccount}:role/cdk-tgw-attachment-file-publisher-\${AWS::Region}`,
            cloudFormationExecutionRole: 'arn:${AWS::Partition}:iam::${AWS::AccountId}:role/tgw-attachment',
        }),
        vpcId: attachment.vpcId,
        tgwId,
    });
});
