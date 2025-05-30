import { typescript, github } from 'projen';
import { NpmAccess } from 'projen/lib/javascript';

const project = new typescript.TypeScriptProject({
  defaultReleaseBranch: 'main',
  name: '@superluminar-io/transit-gw',
  description: 'A lean, opinionated blueprint to deploy Transit Gateway in an AWS Organization.',
  projenrcTs: true,
  bin: {
    'transit-gw': 'bin/transit-gw',
  },
  license: 'MIT',
  authorOrganization: true,
  authorUrl: 'https://superluminar.io',
  authorName: 'superluminar GmbH',
  releaseToNpm: true,
  release: true,
  package: true,
  npmAccess: NpmAccess.PUBLIC,
  repository: 'git+https://github.com/superluminar-io/transit-gw.git',
  deps: [
    'clipanion',
    'typescript',
  ],
  // devDeps: [],             /* Build dependencies for this module. */
  sampleCode: false,
  gitignore: ['/blueprints/**/package-lock.json', '/blueprints/**/yarn.lock'],
  githubOptions: {
    projenCredentials: github.GithubCredentials.fromApp(),
  },
});
project.synth();
