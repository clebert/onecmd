import {resolve} from 'path';
import type {Plugin} from '../types';

export function loadPlugins(moduleName: string): readonly Plugin[] {
  return require(moduleName.startsWith('./')
    ? resolve(moduleName)
    : moduleName);
}
