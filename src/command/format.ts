import type {Argv} from 'yargs';
import type {FormatArgs, Plugin, Process} from '../types';
import {isArgs} from '../util/is-args';
import {isDefined} from '../util/is-defined';
import {spawn} from '../util/spawn';

const commandName = 'format';

export async function format(
  plugins: readonly Plugin[],
  args: {readonly _: readonly unknown[]}
): Promise<void> {
  if (isArgs<FormatArgs>(commandName)(args)) {
    const processes: Process[] = [];

    for (const plugin of plugins) {
      processes.push(...(plugin[commandName]?.(args).filter(isDefined) ?? []));
    }

    if (processes.length === 0) {
      throw new Error(
        `No processes are defined for the ${commandName} command.`
      );
    }

    await Promise.all(processes.map(spawn));
  }
}

format.describe = (argv: Argv) =>
  argv.command(`${commandName} [options]`, '', (command) =>
    command
      .describe('check', '')
      .boolean('check')
      .default('check', false)

      .example(`$0 ${commandName}`, '')
      .example(`$0 ${commandName} --check`, '')
  );
