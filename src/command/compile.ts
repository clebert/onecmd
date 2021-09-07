import type {Argv} from 'yargs';
import type {CompileCommand, CompileOptions} from '../types';
import {spawn} from '../util/spawn';

export async function compile(
  commands: readonly CompileCommand[],
  options: {readonly _: unknown[]}
): Promise<void> {
  if (isCompileOptions(options)) {
    await Promise.all(
      commands.map(async ({path, getArgs}) => spawn(path, getArgs?.(options)))
    );
  }
}

function isCompileOptions(options: {
  readonly _: unknown[];
}): options is CompileOptions & {readonly _: ['compile']} {
  return options._[0] === 'compile';
}

compile.describe = (argv: Argv) =>
  argv.command('compile [options]', '', (command) =>
    command
      .describe('watch', '')
      .boolean('watch')
      .default('watch', false)

      .example('$0 compile', '')
      .example('$0 compile --watch', '')
  );
