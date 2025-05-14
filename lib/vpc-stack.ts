import { Construct } from 'constructs';
import { aws_ec2 as ec2, Stack, StackProps } from "aws-cdk-lib";
import { Tags } from "aws-cdk-lib";


export interface VpcStackProps extends StackProps {
  readonly Cidr: string;
}

export class VpcStack extends Stack {
  constructor(scope: Construct, id: string, props: VpcStackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, "TgwTestVpc", {
      maxAzs: 2,
      ipAddresses: ec2.IpAddresses.cidr(props.Cidr),
      subnetConfiguration: [{
        name: "Isolated",
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        cidrMask: 24,
      }],
    });
  }
}
