import {normalize} from 'path';
import type {Dependency, Source} from '../types';

export interface File {
  readonly filename: string;
  readonly data: string;
}

export async function generateFiles(
  sources: readonly Source[],
  dependencies: readonly Dependency[]
): Promise<readonly File[]> {
  sources = sources.map((source) => ({
    ...source,
    path: normalize(source.path),
  }));

  dependencies = dependencies.map((dependency) => ({
    ...dependency,
    path: normalize(dependency.path),
  }));

  const files: File[] = [];
  const sourcePaths = new Set<string>();

  for (const source of sources) {
    if (sourcePaths.has(source.path)) {
      throw new Error(`Source "${source.path}" already exists.`);
    }

    sourcePaths.add(source.path);
  }

  for (const dependency of dependencies) {
    if (!sourcePaths.has(dependency.path) && dependency.required) {
      throw new Error(`Dependency "${dependency.path}" does not exist.`);
    }
  }

  for (const source of sources) {
    const otherSources: Record<string, {versioned: boolean}> = {};

    for (const otherSource of sources) {
      if (otherSource.path !== source.path) {
        otherSources[otherSource.path] = {
          versioned: otherSource.versioned ?? false,
        };
      }
    }

    if (source.type === 'json') {
      let input = await source.generate(otherSources);

      for (const dependency of dependencies) {
        if (dependency.path === source.path && dependency.type !== 'any') {
          if (dependency.type === 'text') {
            throw new Error(
              `Dependency "${dependency.path}" should be of type "json" instead of "text".`
            );
          }

          input = await dependency.generate(input, otherSources);
        }
      }

      files.push({
        filename: source.path,
        data: JSON.stringify(input, null, 2) + '\n',
      });
    } else if (source.type === 'text') {
      let input = await source.generate(otherSources);

      for (const dependency of dependencies) {
        if (dependency.path === source.path && dependency.type !== 'any') {
          if (dependency.type === 'json') {
            throw new Error(
              `Dependency "${dependency.path}" should be of type "text" instead of "json".`
            );
          }

          input = await dependency.generate(input, otherSources);
        }
      }

      files.push({filename: source.path, data: input.join('\n').trim() + '\n'});
    } else {
      for (const dependency of dependencies) {
        if (dependency.path === source.path && dependency.type !== 'any') {
          throw new Error(
            `Dependency "${dependency.path}" should be of type "any" instead of "${dependency.type}".`
          );
        }
      }
    }
  }

  return files;
}
