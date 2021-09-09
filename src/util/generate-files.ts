import {normalize} from 'path';
import type {Dependency, Source} from '../types';

export interface File {
  readonly filename: string;
  readonly data: string;
}

export function generateFiles(
  sources: readonly Source[],
  dependencies: readonly Dependency[]
): readonly File[] {
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

    if (source.type === 'object') {
      let content = source.generate(otherSources);

      for (const dependency of dependencies) {
        if (dependency.path === source.path && dependency.type !== 'any') {
          if (dependency.type === 'string') {
            throw new Error(
              `Dependency "${dependency.path}" should be of type "object" instead of "string".`
            );
          }

          content = dependency.generate(content, otherSources);
        }
      }

      files.push({filename: source.path, data: source.serialize(content)});
    } else if (source.type === 'string') {
      let content = source.generate(otherSources);

      for (const dependency of dependencies) {
        if (dependency.path === source.path && dependency.type !== 'any') {
          if (dependency.type === 'object') {
            throw new Error(
              `Dependency "${dependency.path}" should be of type "string" instead of "object".`
            );
          }

          content = dependency.generate(content, otherSources);
        }
      }

      files.push({filename: source.path, data: source.serialize(content)});
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
