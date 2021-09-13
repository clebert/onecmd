#!/usr/bin/env node

import {resolve} from 'path';
import compose from 'compose-function';
import yargs from 'yargs';
import {compile} from './command/compile';
import {format} from './command/format';
import {lint} from './command/lint';
import {setup} from './command/setup';
import {test} from './command/test';
import type {Plugin} from './types';

(async () => {
  const args = compose(
    test.describe,
    lint.describe,
    format.describe,
    compile.describe,
    setup.describe
  )(
    yargs
      .usage('Usage: $0 <command> [options]')
      .help('h')
      .alias('h', 'help')
      .detectLocale(false)
      .demandCommand(1, 1)
      .epilogue(
        'One command to setup, compile, format, lint, and test them all.'
      )
      .strict()
  ).argv as {readonly _: readonly unknown[]};

  const plugins = require(resolve('./onecmd.js')) as readonly Plugin[];

  await setup(plugins, args);
  await compile(plugins, args);
  await format(plugins, args);
  await lint(plugins, args);
  await test(plugins, args);
})().catch((error) => {
  if (error instanceof Error && error.message) {
    console.error(error.message);
  }

  process.exit(1);
});
