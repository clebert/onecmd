import type {Argv} from 'yargs';
import type {TestCommand, TestOptions} from '../types';
import {isOptions} from '../util/is-options';
import {spawn} from '../util/spawn';

const commandName = 'test';

export async function test(
  commands: readonly TestCommand[],
  options: {readonly _: unknown[]}
): Promise<void> {
  if (isOptions<TestOptions>(commandName)(options)) {
    await Promise.all(
      commands.map(async ({path, getArgs}) => spawn(path, getArgs?.(options)))
    );
  }
}

test.describe = (argv: Argv) =>
  argv.command(`${commandName} [options]`, '', (command) =>
    command
      .describe('watch', '')
      .boolean('watch')
      .default('watch', false)

      .example(`$0 ${commandName}`, '')
      .example(`$0 ${commandName} --watch`, '')
  );
