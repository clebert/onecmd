import type {Argv} from 'yargs';
import type {FmtCommand, FmtOptions} from '../types';
import {isOptions} from '../util/is-options';
import {spawn} from '../util/spawn';

const commandName = 'fmt';

export async function fmt(
  commands: readonly FmtCommand[],
  options: {readonly _: unknown[]}
): Promise<void> {
  if (isOptions<FmtOptions>(commandName)(options)) {
    if (commands.length === 0) {
      throw new Error('There are no commands for formatting.');
    }

    await Promise.all(
      commands.map(async ({path, getArgs}) => spawn(path, getArgs?.(options)))
    );
  }
}

fmt.describe = (argv: Argv) =>
  argv.command(`${commandName} [options]`, '', (command) =>
    command
      .describe('check', '')
      .boolean('check')
      .default('check', false)

      .example(`$0 ${commandName}`, '')
      .example(`$0 ${commandName} --check`, '')
  );
