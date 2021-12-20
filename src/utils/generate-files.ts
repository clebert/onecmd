import {posix} from 'path';
import type {FileAttrs, FileOp} from '../types';

export interface FileBlob {
  readonly path: string;
  readonly data: string;
}

export function generateFiles(ops: readonly FileOp[]): readonly FileBlob[] {
  const blobs: FileBlob[] = [];
  const files: {[path: string]: FileAttrs} = {};

  for (const op of ops) {
    if (posix.isAbsolute(op.path)) {
      throw new Error(`The path to file "${op.path}" must be relative.`);
    }

    if (op.path !== posix.normalize(op.path)) {
      throw new Error(`The path to file "${op.path}" must be normalized.`);
    }

    if (op.type === `new` || op.type === `ref`) {
      if (files[op.path]) {
        throw new Error(
          `The file "${op.path}" can be created or referenced only once.`,
        );
      }

      files[op.path] = op.attrs ?? {};
    }
  }

  for (const op1 of ops) {
    if (op1.type === `new`) {
      const {[op1.path]: _, ...otherFiles} = files;

      let content = op1.create(otherFiles);

      for (const op2 of ops) {
        if (op2.type === `mod` && op2.path === op1.path) {
          if (!op2.is(content)) {
            throw new Error(
              `The content of file "${op2.path}" is incompatible and cannot be modified.`,
            );
          }

          content = op2.update(content, otherFiles);
        }
      }

      if (!op1.is(content)) {
        throw new Error(`The content of file "${op1.path}" is malformed.`);
      }

      blobs.push({path: op1.path, data: op1.serialize(content)});
    } else if (op1.type === `ref`) {
      for (const op2 of ops) {
        if (op2.type === `mod` && op2.path === op1.path) {
          throw new Error(
            `The file "${op2.path}" is only referenced and cannot be modified.`,
          );
        }
      }
    }
  }

  return blobs;
}
