import type {Argv} from 'yargs';
import type {CompileCommand, CompileOptions} from '../types';
import {isOptions} from '../util/is-options';
import {spawn} from '../util/spawn';

const commandName = 'compile';

export async function compile(
  commands: readonly CompileCommand[],
  options: {readonly _: unknown[]}
): Promise<void> {
  if (isOptions<CompileOptions>(commandName)(options)) {
    if (commands.length === 0) {
      throw new Error('There are no commands for compiling.');
    }

    await Promise.all(
      commands.map(async ({path, getArgs}) => spawn(path, getArgs?.(options)))
    );
  }
}

compile.describe = (argv: Argv) =>
  argv.command(`${commandName} [options]`, '', (command) =>
    command
      .describe('watch', '')
      .boolean('watch')
      .default('watch', false)

      .example(`$0 ${commandName}`, '')
      .example(`$0 ${commandName} --watch`, '')
  );
