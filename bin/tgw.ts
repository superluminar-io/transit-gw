import { App } from 'aws-cdk-lib';
import { TgwAttachmentAssetsStack } from "../lib/tgw-attachment-assets-stack";
import { TransitGatewayStack } from '../lib/tgw-stack';
import { config } from "../config";
// import { VpcStack } from "../lib/vpc-stack";


const attachments = config.attachments;
const principals = attachments.map(a => a.accountId).filter((v, i, a) => a.indexOf(v) === i);

const app = new App();

/* * /
// We create some VPCs in a spoke account to have something to play with
new VpcStack(app, 'VpcStack1', { env: { account: '241734811004' }, Cidr: '10.2.0.0/16' });
new VpcStack(app, 'VpcStack2', { env: { account: '241734811004' }, Cidr: '10.4.0.0/16' });
/* */

new TgwAttachmentAssetsStack(app, 'AttachmentAssets');

const tgw = new TransitGatewayStack(app, 'TransitGateway', {
    shareToPrincipals: principals,
});
