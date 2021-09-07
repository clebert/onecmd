#!/usr/bin/env node

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
import {isDefined} from './util/is-defined';
import {loadPlugins} from './util/load-plugins';

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
      .epilogue('One command to compile, fmt, lint, and test them all.')
      .strict()
  ).argv as {readonly _: unknown[]};

  const commands: Command[] = [];
  const sources: Source[] = [];
  const dependencies: Dependency[] = [];

  for (const plugin of loadPlugins('./onecmd.js')) {
    commands.push(...(plugin.commands ?? []).filter(isDefined));
    sources.push(...(plugin.sources ?? []).filter(isDefined));
    dependencies.push(...(plugin.dependencies ?? []).filter(isDefined));
  }

  await setup(sources, dependencies, options);
  await compile(commands.filter(isCompileCommand), options);
  await fmt(commands.filter(isFmtCommand), options);
  await lint(commands.filter(isLintCommand), options);
  await test(commands.filter(isTestCommand), options);
})().catch((error) => {
  if (error instanceof Error && error.message) {
    console.error(error.message);
  }

  process.exit(1);
});

function isCompileCommand(command: Command): command is CompileCommand {
  return command.type === 'compile';
}

function isFmtCommand(command: Command): command is FmtCommand {
  return command.type === 'fmt';
}
function isLintCommand(command: Command): command is LintCommand {
  return command.type === 'lint';
}

function isTestCommand(command: Command): command is TestCommand {
  return command.type === 'test';
}
