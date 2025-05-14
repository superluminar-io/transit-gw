import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from 'constructs';
import { SharedTransitGateway } from "./constructs/transit-gateway";


export interface TgwStackProps extends StackProps {
  /**
   * The principals to which we want to share the transit gateway via AWS Resource Access Manager
   */
  readonly shareToPrincipals: string[];
}

export class TransitGatewayStack extends Stack {
  transitGatewayArn: string;
  transitGatewayId: string;

  constructor(scope: Construct, id: string, props?: TgwStackProps) {
    super(scope, id, props);

    const transitGateway = new SharedTransitGateway(this, 'TransitGateway', {
      name: 'SharedTransitGateway',
      shareName: 'SharedTransitGateway',
      shareToPrincipals: props?.shareToPrincipals ?? [],
      autoAcceptSharedAttachment: true,
    });
    this.transitGatewayArn = transitGateway.transitGatewayArn;
    this.transitGatewayId = transitGateway.transitGatewayId;

    new CfnOutput(this, 'TransitGatewayId', {
      value: transitGateway.transitGatewayId,
    });
    new CfnOutput(this, 'TransitGatewayArn', {
      value: transitGateway.transitGatewayArn,
    });
  }
}
