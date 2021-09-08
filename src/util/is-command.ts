import type {Command} from '../types';

export function isCommand<TCommand extends Command>(
  type: TCommand['type']
): (command: Command) => command is TCommand {
  return (command): command is TCommand => command.type === type;
}
