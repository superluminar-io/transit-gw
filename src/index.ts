#!/usr/bin/env -S npx ts-node

import { Builtins, Cli } from 'clipanion';
import { Init } from './commands/init';

const [, , ...args] = process.argv;

const cli = new Cli({
  binaryLabel: 'Transit Gateway Blueprint',
  binaryName: 'transit-gw-blueprint',
});
cli.register(Builtins.HelpCommand);
cli.register(Init);
void cli.runExit(args);
