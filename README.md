# Transit GW

An opinionated blueprint to make deployment and maintenance of a Transit Gateway
in an AWS organization easier.

## What it does

This blueprint deploys a Transit Gateway in a hub account and shares it
with AWS Organizations member accounts (spoke accounts). It lets you manage
the spoke VPC attachments, and helps you manage the Transit Gateway route tables.

I uses Typescript CDK to generate the CloudFormation templates that are used to
deploy the necessary resources into the hub and member accounts.

## Architecture

![Architecture](./blueprints/transit-gw/img/architecture.png)

## Getting started

You can use this blueprint as part of another project or standalone.

Initialize the blueprint with the following commands:

```bash
npx @superluminar-io/transit-gw init
npm install
```

This will create a `transit-gw` directory with the necessary files in
your current working directory.

Then read the included [README](./blueprints/transit-gw/README.md)
for information on how to use it.
