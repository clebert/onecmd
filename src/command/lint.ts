import type {Argv} from 'yargs';
import type {LintCommand, LintOptions} from '../types';
import {spawn} from '../util/spawn';

export async function lint(
  commands: readonly LintCommand[],
  options: {readonly _: unknown[]}
): Promise<void> {
  if (isLintOptions(options)) {
    await Promise.all(
      commands.map(async ({path, getArgs}) => spawn(path, getArgs?.(options)))
    );
  }
}

function isLintOptions(options: {
  readonly _: unknown[];
}): options is LintOptions & {readonly _: ['lint']} {
  return options._[0] === 'lint';
}

lint.describe = (argv: Argv) =>
  argv.command('lint [options]', '', (command) =>
    command
      .describe('fix', '')
      .boolean('fix')
      .default('fix', false)

      .example('$0 lint', '')
      .example('$0 lint --fix', '')
  );
