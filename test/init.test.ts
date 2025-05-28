import fs from 'fs';
import { Cli } from 'clipanion';
import { Init } from '../src/commands/init';

const cli = new Cli();
cli.register(Init);

test('hello', async () => {
  const result = await cli.runExit(['init', '--blueprint', 'transit-gw']);
  await fs.rmSync('transit-gw', { recursive: true, force: true });
  expect(result).toBe(undefined);
});
