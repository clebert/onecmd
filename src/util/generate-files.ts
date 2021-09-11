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
      throw new Error(`File "${source.path}" already exists.`);
    }

    sourcePaths.add(source.path);
  }

  for (const dependency of dependencies) {
    if (!sourcePaths.has(dependency.path) && dependency.required) {
      throw new Error(`Required file "${dependency.path}" does not exist.`);
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
            (otherSource.type === 'unmanaged' && otherSource.editable) ?? false,

          versionable: otherSource.versionable ?? false,
        };
      }
    }

    if (source.type === 'managed') {
      let content = source.create(otherSources);

      for (const dependency of dependencies) {
        if (dependency.path === source.path && dependency.type !== 'any') {
          if (!dependency.is(content)) {
            throw new Error(
              `Incompatible file "${source.path}" cannot be updated.`
            );
          }

          content = dependency.update(content, otherSources);
        }
      }

      if (!source.is(content)) {
        throw new Error(
          `Malformed file "${source.path}" cannot be serialized.`
        );
      }

      files.push({filename: source.path, data: source.serialize(content)});
    } else {
      for (const dependency of dependencies) {
        if (dependency.path === source.path && dependency.type !== 'any') {
          throw new Error(`Unmanaged file "${source.path}" cannot be updated.`);
        }
      }
    }
  }

  return files;
}
