#!/bin/sh

npm run clear-context

npm run tgw deploy AttachmentAssets TransitGateway && \
  npm run tgw-routing deploy && \
  npm run tgw-attachments deploy -- --all && \
  npm run tgw-routing deploy
