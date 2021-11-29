import {writeFile} from 'fs/promises';
import {dirname} from 'path';
import mkdir from 'mkdirp';
import type {Argv} from 'yargs';
import type {FileOp, Plugin} from '../types';
import {generateFiles} from '../utils/generate-files';
import {isArgs} from '../utils/is-args';
import {isDefined} from '../utils/is-defined';

const commandName = 'setup';

export async function setup(
  plugins: readonly Plugin[],
  args: {readonly _: readonly unknown[]}
): Promise<void> {
  if (isArgs(commandName)(args)) {
    const ops: FileOp[] = [];

    for (const plugin of plugins) {
      ops.push(...(plugin[commandName]?.().filter(isDefined) ?? []));
    }

    for (const {path, data} of generateFiles(ops)) {
      await mkdir(dirname(path));
      await writeFile(path, data, {encoding: 'utf-8'});
    }
  }
}

setup.describe = (argv: Argv) =>
  argv.command(`${commandName} [options]`, '', (command) =>
    command.example(`$0 ${commandName}`, '')
  );
