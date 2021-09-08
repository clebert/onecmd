import {writeFile} from 'fs/promises';
import {dirname} from 'path';
import mkdir from 'mkdirp';
import type {Argv} from 'yargs';
import type {Dependency, Source} from '../types';
import {generateFiles} from '../util/generate-files';
import {isOptions} from '../util/is-options';

const commandName = 'setup';

export async function setup(
  sources: readonly Source[],
  dependencies: readonly Dependency[],
  options: {readonly _: unknown[]}
): Promise<void> {
  if (isOptions(commandName)(options)) {
    for (const {filename, data} of generateFiles(sources, dependencies)) {
      await mkdir(dirname(filename));
      await writeFile(filename, data, {encoding: 'utf-8'});
    }
  }
}

setup.describe = (argv: Argv) =>
  argv.command(`${commandName} [options]`, '', (command) =>
    command.example(`$0 ${commandName}`, '')
  );
