import { Construct } from 'constructs';
import { aws_iam as iam, Stack, StackProps } from "aws-cdk-lib";
import { config } from "../config";


export class VpcAttachmentRoleStack extends Stack {

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new iam.Role(this, 'TgwAttachmentRole', {
      roleName: 'tgw-attachment',
      assumedBy: new iam.CompositePrincipal(
          new iam.ServicePrincipal('cloudformation.amazonaws.com'),
          new iam.AccountPrincipal(config.transitGatewayAccountId).withSessionTags(),
      ),
      managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess')],
    });
  }
}
