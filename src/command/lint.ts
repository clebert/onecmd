import type {Argv} from 'yargs';
import type {LintArgs, Plugin, Process} from '../types';
import {isArgs} from '../util/is-args';
import {isDefined} from '../util/is-defined';
import {spawn} from '../util/spawn';

const commandName = 'lint';

export async function lint(
  plugins: readonly Plugin[],
  args: {readonly _: readonly unknown[]}
): Promise<void> {
  if (isArgs<LintArgs>(commandName)(args)) {
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

lint.describe = (argv: Argv) =>
  argv.command(`${commandName} [options]`, '', (command) =>
    command
      .describe('fix', '')
      .boolean('fix')
      .default('fix', false)

      .example(`$0 ${commandName}`, '')
      .example(`$0 ${commandName} --fix`, '')
  );
