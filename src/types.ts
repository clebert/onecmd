export interface Plugin {
  readonly commands?: readonly (Command | undefined)[];
  readonly sources?: readonly (Source | undefined)[];
  readonly dependencies?: readonly (Dependency | undefined)[];
}

export type Command = CompileCommand | FmtCommand | LintCommand | TestCommand;

export interface CompileCommand {
  readonly type: 'compile';
  readonly path: string;

  getArgs?(options: CompileOptions): readonly (string | undefined)[];
}

export interface CompileOptions {
  readonly watch: boolean;
}

export interface FmtCommand {
  readonly type: 'fmt';
  readonly path: string;

  getArgs?(options: FmtOptions): readonly (string | undefined)[];
}

export interface FmtOptions {
  readonly check: boolean;
}

export interface LintCommand {
  readonly type: 'lint';
  readonly path: string;

  getArgs?(options: LintOptions): readonly (string | undefined)[];
}

export interface LintOptions {
  readonly fix: boolean;
}

export interface TestCommand {
  readonly type: 'test';
  readonly path: string;

  getArgs?(options: TestOptions): readonly (string | undefined)[];
}

export interface TestOptions {
  readonly watch: boolean;
}

export type Source = ObjectSource | StringSource | UnknownSource;

export interface ObjectSource {
  readonly type: 'object';
  readonly path: string;
  readonly versioned?: boolean;

  generate(otherSources: Sources): object;
  serialize(content: object): string;
}

export interface StringSource {
  readonly type: 'string';
  readonly path: string;
  readonly versioned?: boolean;

  generate(otherSources: Sources): string;
  serialize(content: string): string;
}

export interface UnknownSource {
  readonly type: 'unknown';
  readonly path: string;
  readonly versioned?: boolean;
}

export interface Sources {
  readonly [path: string]: {readonly versioned: boolean};
}

export type Dependency = AnyDependency | ObjectDependency | StringDependency;

export interface AnyDependency {
  readonly type: 'any';
  readonly path: string;
  readonly required: true;
}

export interface ObjectDependency {
  readonly type: 'object';
  readonly path: string;
  readonly required?: boolean;

  generate(content: object, otherSources: Sources): object;
}

export interface StringDependency {
  readonly type: 'string';
  readonly path: string;
  readonly required?: boolean;

  generate(content: string, otherSources: Sources): string;
}
