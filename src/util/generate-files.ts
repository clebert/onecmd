import {normalize} from 'path';
import type {Dependency, Source} from '../types';
import {serialize} from './serialize';

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

    if (source.type === 'artifact') {
      for (const dependency of dependencies) {
        if (dependency.path === source.path && dependency.type !== 'any') {
          throw new Error(
            `Dependency "${dependency.path}" should be of type "any" instead of "${dependency.type}".`
          );
        }
      }
    } else {
      let input: any = await source.generate(otherSources);

      for (const dependency of dependencies) {
        if (dependency.path === source.path && dependency.type !== 'any') {
          if (dependency.type !== source.type) {
            throw new Error(
              `Dependency "${dependency.path}" should be of type "${source.type}" instead of "${dependency.type}".`
            );
          }

          input = await dependency.generate(input, otherSources);
        }
      }

      files.push({filename: source.path, data: serialize(source.type, input)});
    }
  }

  return files;
}
