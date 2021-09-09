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
    const otherSources: Record<
      string,
      {editable: boolean; versionable: boolean}
    > = {};

    for (const otherSource of sources) {
      if (otherSource.path !== source.path) {
        otherSources[otherSource.path] = {
          editable:
            (otherSource.type === 'unknown' && otherSource.editable) ?? false,

          versionable: otherSource.versionable ?? false,
        };
      }
    }

    if (source.type !== 'unknown') {
      let content = source.generate(otherSources);

      for (const dependency of dependencies) {
        if (dependency.path === source.path && dependency.type !== 'any') {
          if (dependency.type !== source.type) {
            throw new Error(
              `Dependency "${dependency.path}" should be of type "${source.type}" instead of "${dependency.type}".`
            );
          }

          // @ts-expect-error
          content = dependency.generate(content, otherSources);
        }
      }

      // @ts-expect-error
      const data = source.serialize(content);

      files.push({filename: source.path, data});
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
