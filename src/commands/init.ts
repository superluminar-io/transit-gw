import { Command, Option } from 'clipanion';
import { blueprintExists, renderBlueprint } from '../core/blueprint/blueprint';

const TRANSIT_GW_BLUEPRINTS_GITHUB_URL = 'https://github.com/superluminar-io/transit-gw/tree/main/blueprints';

export class Init extends Command {
  static paths = [['init']];

  static usage = Command.Usage({
    description: 'Generate an initial transit-gw project based on a blueprint.',
    details: 'A list of blueprints can be found in the transit-gw repository: ' + TRANSIT_GW_BLUEPRINTS_GITHUB_URL,
    examples: [
      ['Generate a transit-gw project', '$0 init --blueprint transit-gw'],
    ],
  });

  blueprint = Option.String('--blueprint', {
    description: 'The name of the blueprint to use for the project. Defaults to `foundational`.',
  });
  force = Option.Boolean('--force', {
    description: 'Force overwrite of existing files.',
  });

  async execute() {
    const blueprint = this.blueprint || 'transit-gw';
    if (!blueprintExists(blueprint)) {
      throw new Error(`Blueprint ${blueprint} does not exist. Please check the available blueprints at ${TRANSIT_GW_BLUEPRINTS_GITHUB_URL}`);
    }
    try {
      await renderBlueprint(blueprint, { forceOverwrite: this.force || false });
    } finally {
      //
    }
    console.log('Done. ✅');
  }
}
