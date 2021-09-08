import type {Argv} from 'yargs';
import type {LintCommand, LintOptions} from '../types';
import {isOptions} from '../util/is-options';
import {spawn} from '../util/spawn';

const commandName = 'lint';

export async function lint(
  commands: readonly LintCommand[],
  options: {readonly _: unknown[]}
): Promise<void> {
  if (isOptions<LintOptions>(commandName)(options)) {
    await Promise.all(
      commands.map(async ({path, getArgs}) => spawn(path, getArgs?.(options)))
    );
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
