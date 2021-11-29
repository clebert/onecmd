export function isArgs<TArgs>(
  commandName: string
): (args: {
  readonly _: readonly unknown[];
}) => args is TArgs & {readonly _: [string]} {
  return (args): args is TArgs & {readonly _: [string]} =>
    args._[0] === commandName;
}
