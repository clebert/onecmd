import {spawn as spawnAsync} from 'child_process';
import type {Process} from '../types';
import {isDefined} from './is-defined';

export async function spawn(process: Process): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const childProcess = spawnAsync(
      process.command,
      process.args?.filter(isDefined).filter(Boolean) ?? [],
      {stdio: `inherit`},
    );

    childProcess.once(`close`, (code, signal) => {
      if (code === 0) {
        resolve();
      } else {
        reject(
          new Error(
            `The process ${JSON.stringify(
              process.command,
            )} has terminated with ${
              code ? `code ${code}` : `signal ${signal}`
            }.`,
          ),
        );
      }
    });

    childProcess.once(`error`, reject);
  });
}
