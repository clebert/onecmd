export interface Plugin {
  setup?(): readonly (FileOp | undefined)[];
  compile?(args: CompileArgs): readonly (Process | undefined)[];
  format?(args: FormatArgs): readonly (Process | undefined)[];
  lint?(args: LintArgs): readonly (Process | undefined)[];
  test?(args: TestArgs): readonly (Process | undefined)[];
}

export type FileOp = NewFile<any> | ModFile<any> | RefFile;

export interface NewFile<TContent> {
  readonly type: 'new';
  readonly path: string;
  readonly attrs?: FileAttrs;

  is(content: unknown): content is TContent;
  create(otherFiles: Files): TContent;
  serialize(content: TContent): string;
}

export interface ModFile<TContent> {
  readonly type: 'mod';
  readonly path: string;

  is(content: unknown): content is TContent;
  update(content: TContent, otherFiles: Files): TContent;
}

export interface RefFile {
  readonly type: 'ref';
  readonly path: string;
  readonly attrs?: FileAttrs;
}

export interface Files {
  readonly [path: string]: FileAttrs;
}

export interface FileAttrs {
  readonly pretty?: boolean;
  readonly versioned?: boolean;
  readonly visible?: boolean;
}

export interface CompileArgs {
  readonly watch: boolean;
}

export interface FormatArgs {
  readonly check: boolean;
}

export interface LintArgs {
  readonly fix: boolean;
}

export interface TestArgs {
  readonly watch: boolean;
}

export interface Process {
  readonly command: string;
  readonly args?: readonly (string | undefined)[];
}
