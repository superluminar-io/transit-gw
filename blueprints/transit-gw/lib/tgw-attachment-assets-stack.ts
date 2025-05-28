import { Construct } from 'constructs';
import { aws_iam as iam, aws_s3 as s3, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { config } from "../config";


export class TgwAttachmentAssetsStack extends Stack {

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    /* */
    const assetBucket = new s3.Bucket(this, 'TgwAttachmentFileAssetBucket', {
      bucketName: `cdk-tgw-attachment-assets-${this.account}-${this.region}`,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      versioned: false,
      removalPolicy: RemovalPolicy.RETAIN,
    });
    assetBucket.grantRead(new iam.OrganizationPrincipal(config.organizationId));

    /* */
    const publisher = new iam.Role(this, 'TgwAttachmentFileAssetPublisher', {
      roleName: `cdk-tgw-attachment-file-publisher-${this.region}`,
      assumedBy: new iam.AccountRootPrincipal().withSessionTags(),
    });
    assetBucket.grantReadWrite(publisher);
    /* */
  }
}
