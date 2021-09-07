import {dump} from 'js-yaml';

export function serialize<TType extends 'json' | 'yaml' | 'text'>(
  type: TType,
  value: TType extends 'text' ? readonly string[] : object
): string {
  return type === 'json'
    ? JSON.stringify(value, null, 2) + '\n'
    : type === 'yaml'
    ? dump(value)
    : (value as readonly string[]).join('\n') + '\n';
}
