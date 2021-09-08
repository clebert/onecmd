export function isOptions<TOptions>(
  commandName: string
): (options: {
  readonly _: unknown[];
}) => options is TOptions & {readonly _: [string]} {
  return (options): options is TOptions & {readonly _: [string]} =>
    options._[0] === commandName;
}
