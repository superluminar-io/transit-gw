import { App, DefaultStackSynthesizer } from 'aws-cdk-lib';
import { VpcAttachmentRoleStack } from "../lib/vpc-attachment-role-stack";


const app = new App();
new VpcAttachmentRoleStack(app, 'VpcAttachmentRole', {
    synthesizer: new DefaultStackSynthesizer({
        generateBootstrapVersionRule: false
    })
});
app.synth();
