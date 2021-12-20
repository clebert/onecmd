import type {Argv} from 'yargs';
import type {CompileArgs, Plugin, Process} from '../types';
import {isArgs} from '../utils/is-args';
import {isDefined} from '../utils/is-defined';
import {spawn} from '../utils/spawn';

const commandName = `compile`;

export async function compile(
  plugins: readonly Plugin[],
  args: {readonly _: readonly unknown[]},
): Promise<void> {
  if (isArgs<CompileArgs>(commandName)(args)) {
    const processes: Process[] = [];

    for (const plugin of plugins) {
      processes.push(...(plugin[commandName]?.(args).filter(isDefined) ?? []));
    }

    if (processes.length === 0) {
      throw new Error(
        `No processes are defined for the ${commandName} command.`,
      );
    }

    await Promise.all(processes.map(spawn));
  }
}

compile.describe = (argv: Argv) =>
  argv.command(`${commandName} [options]`, ``, (command) =>
    command
      .describe(`watch`, ``)
      .boolean(`watch`)
      .default(`watch`, false)

      .example(`$0 ${commandName}`, ``)
      .example(`$0 ${commandName} --watch`, ``),
  );
