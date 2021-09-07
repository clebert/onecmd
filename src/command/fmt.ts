import type {Argv} from 'yargs';
import type {FmtCommand, FmtOptions} from '../types';
import {spawn} from '../util/spawn';

export async function fmt(
  commands: readonly FmtCommand[],
  options: {readonly _: unknown[]}
): Promise<void> {
  if (isFmtOptions(options)) {
    await Promise.all(
      commands.map(async ({path, getArgs}) => spawn(path, getArgs?.(options)))
    );
  }
}

function isFmtOptions(options: {
  readonly _: unknown[];
}): options is FmtOptions & {readonly _: ['fmt']} {
  return options._[0] === 'fmt';
}

fmt.describe = (argv: Argv) =>
  argv.command('fmt [options]', '', (command) =>
    command
      .describe('check', '')
      .boolean('check')
      .default('check', false)

      .example('$0 fmt', '')
      .example('$0 fmt --check', '')
  );
