#!/usr/bin/env node

import {resolve} from 'path';
import compose from 'compose-function';
import yargs from 'yargs';
import {compile} from './command/compile';
import {fmt} from './command/fmt';
import {lint} from './command/lint';
import {setup} from './command/setup';
import {test} from './command/test';
import type {
  Command,
  Source,
  Dependency,
  CompileCommand,
  FmtCommand,
  LintCommand,
  TestCommand,
} from './types';
import {isCommand} from './util/is-command';
import {isDefined} from './util/is-defined';

(async () => {
  const options = compose(
    test.describe,
    lint.describe,
    fmt.describe,
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
  ).argv as {readonly _: unknown[]};

  const commands: Command[] = [];
  const sources: Source[] = [];
  const dependencies: Dependency[] = [];

  for (const plugin of require(resolve('./onecmd.js'))) {
    commands.push(...(plugin.commands ?? []).filter(isDefined));
    sources.push(...(plugin.sources ?? []).filter(isDefined));
    dependencies.push(...(plugin.dependencies ?? []).filter(isDefined));
  }

  await setup(sources, dependencies, options);
  await compile(commands.filter(isCommand<CompileCommand>('compile')), options);
  await fmt(commands.filter(isCommand<FmtCommand>('fmt')), options);
  await lint(commands.filter(isCommand<LintCommand>('lint')), options);
  await test(commands.filter(isCommand<TestCommand>('test')), options);
})().catch((error) => {
  if (error instanceof Error && error.message) {
    console.error(error.message);
  }

  process.exit(1);
});
