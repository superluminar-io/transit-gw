import { App } from 'aws-cdk-lib';
import { TgwRoutingStack } from "../lib/tgw-routing-stack";
import { config } from "../config";


if (!config.transitGatewayId) {
    console.log('No Transit Gateway ID found in config');
    process.exit();
}

const app = new App();

new TgwRoutingStack(app, 'TgwRouting', {
    env: { region: process.env.AWS_DEFAULT_REGION },
    tgwId: config.transitGatewayId
});
