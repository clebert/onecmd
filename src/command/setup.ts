import {writeFile} from 'fs/promises';
import {dirname} from 'path';
import mkdir from 'mkdirp';
import type {Argv} from 'yargs';
import type {Dependency, Source} from '../types';
import {generateFiles} from '../util/generate-files';

export async function setup(
  sources: readonly Source[],
  dependencies: readonly Dependency[],
  options: {readonly _: unknown[]}
): Promise<void> {
  if (isSetupOptions(options)) {
    for (const {filename, data} of await generateFiles(sources, dependencies)) {
      await mkdir(dirname(filename));
      await writeFile(filename, data, {encoding: 'utf-8'});
    }
  }
}

function isSetupOptions(options: {
  readonly _: unknown[];
}): options is {readonly _: ['setup']} {
  return options._[0] === 'setup';
}

setup.describe = (argv: Argv) =>
  argv.command('setup [options]', '', (command) =>
    command.example('$0 setup', '')
  );
