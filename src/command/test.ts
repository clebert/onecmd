import type {Argv} from 'yargs';
import type {TestCommand, TestOptions} from '../types';
import {spawn} from '../util/spawn';

export async function test(
  commands: readonly TestCommand[],
  options: {readonly _: unknown[]}
): Promise<void> {
  if (isTestOptions(options)) {
    await Promise.all(
      commands.map(async ({path, getArgs}) => spawn(path, getArgs?.(options)))
    );
  }
}

function isTestOptions(options: {
  readonly _: unknown[];
}): options is TestOptions & {readonly _: ['test']} {
  return options._[0] === 'test';
}

test.describe = (argv: Argv) =>
  argv.command('test [options]', '', (command) =>
    command
      .describe('watch', '')
      .boolean('watch')
      .default('watch', false)

      .example('$0 test', '')
      .example('$0 test --watch', '')
  );
