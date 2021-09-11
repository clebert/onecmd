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

export type Source = ManagedSource<any> | UnmanagedSource;

export interface ManagedSource<TContent> {
  readonly type: 'managed';
  readonly path: string;
  readonly versionable?: boolean;

  is(content: unknown): content is TContent;
  create(otherSources: Sources): TContent;
  serialize(content: TContent): string;
}

export interface UnmanagedSource {
  readonly type: 'unmanaged';
  readonly path: string;
  readonly editable?: boolean;
  readonly versionable?: boolean;
}

export interface Sources {
  readonly [path: string]: {
    readonly editable: boolean;
    readonly versionable: boolean;
  };
}

export type Dependency = AnyDependency | ManagedDependency<any>;

export interface AnyDependency {
  readonly type: 'any';
  readonly path: string;
  readonly required: true;
}

export interface ManagedDependency<TContent> {
  readonly type: 'managed';
  readonly path: string;
  readonly required?: boolean;

  is(content: unknown): content is TContent;
  update(content: TContent, otherSources: Sources): TContent;
}
