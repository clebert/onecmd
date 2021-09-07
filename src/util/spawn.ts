import {spawn as spawnAsync} from 'child_process';
import {normalize} from 'path';
import {isDefined} from './is-defined';

export async function spawn(
  path: string,
  args: readonly (string | undefined)[] | undefined
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const childProcess = spawnAsync(
      path,
      args?.filter(isDefined).filter(Boolean) ?? [],
      {stdio: 'inherit'}
    );

    childProcess.once('close', (code, signal) => {
      if (code === 0) {
        resolve();
      } else {
        reject(
          new Error(
            `The process ${JSON.stringify(
              normalize(path)
            )} terminated with the ${
              code ? `code ${code}` : `signal ${signal}`
            }.`
          )
        );
      }
    });

    childProcess.once('error', reject);
  });
}
