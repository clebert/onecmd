# onecmd

[![][ci-badge]][ci-link] [![][version-badge]][version-link]
[![][license-badge]][license-link]

[ci-badge]: https://github.com/clebert/onecmd/workflows/CI/badge.svg
[ci-link]: https://github.com/clebert/onecmd
[version-badge]: https://badgen.net/npm/v/onecmd
[version-link]: https://www.npmjs.com/package/onecmd
[license-badge]: https://badgen.net/npm/license/onecmd
[license-link]: https://github.com/clebert/onecmd/blob/master/LICENSE.md

One command to `setup`, `compile`, `fmt`, `lint`, and `test` them all.

## Installation

```
npm install onecmd --save-dev
```

## Abstract

Inspired by the [configuration-free](https://golang.org/doc/articles/go_command)
approach of _Go_, **onecmd** should serve as a single tool to set up, compile,
format, lint, and test TypeScript or JavaScript projects.

## Rationale

In many projects, the tools used and the associated configuration files are
often identical. The jumble of configuration files distracts from the actual
content, and they are always tedious to create and keep up to date. Furthermore,
tools are often interrelated and require mutual adjustments in their respective
configurations. Standard conventions could be derived to set up such projects in
a uniform way.

Project templates are of little help, as they can often only be applied
initially and are difficult to adapt to the dynamic requirements of different
project types. Tools like _Create React App_ are specialized and cannot be used
generically for all projects.

## Getting started

**onecmd** serves as a generic tool for dynamic management of projects and is
fully customizable via user-defined plugins in the
[`onecmd.js`](https://github.com/clebert/onecmd/blob/main/onecmd.js) file. A
plugin specifies commands executed while compiling, formatting, linting,
testing, and source files and dependencies on other source files generated
during setup.

Only a single plugin can own a particular file, specify its initial content,
control its serialization, and determine whether or not the file is subject to
version control. Other plugins can declare this file as an optional or required
dependency and manipulate it during setup.

The files generated in this way usually do not need to be subject to version
control. The advantage of **onecmd**'s approach of automatically generated
configuration files is that the existing editor extensions continue to function
normally.

A set of coordinated plugins based on standard conventions could serve as a
basis to allow easy and consistent management of projects together with
**onecmd**. One such attempt is the package
[`@onecmd/standard-plugins`](https://github.com/clebert/onecmd-standard-plugins).

### Usage

1. Install **onecmd**: `npm install onecmd --save-dev`
2. Create a file named `onecmd.js`:

```js
// @ts-check

const plugins = require('@onecmd/standard-plugins');

module.exports = [
  plugins.babel(),
  plugins.editorconfig(),
  plugins.eslint(),
  plugins.git(),
  plugins.jest({coverage: true}),
  plugins.node('16'),
  plugins.npm(),
  plugins.prettier(),
  plugins.typescript('node', 'package'),
  plugins.vscode({showFilesInEditor: false}),
];
```

3. Run: `onecmd setup`
4. Run: `onecmd compile && onecmd fmt --check && onecmd lint && onecmd test`

### Configuration

Define plugins in the file `onecmd.js`:

```js
module.exports = [
  {
    commands: [
      {
        type: 'compile',
        path: 'path/to/bin',
        getArgs: ({watch}) => ['--arg1', watch ? '--arg2' : undefined],
      },
      {
        type: 'fmt',
        path: 'path/to/bin',
        getArgs: ({check}) => ['--arg1', check ? '--arg2' : undefined],
      },
      {
        type: 'lint',
        path: 'path/to/bin',
        getArgs: ({fix}) => ['--arg1', fix ? '--arg2' : undefined],
      },
      {
        type: 'test',
        path: 'path/to/bin',
        getArgs: ({watch}) => ['--arg1', watch ? '--arg2' : undefined],
      },
    ],
    sources: [
      {
        type: 'string',
        path: 'path/to/file.txt',
        versionable: true, // The file should be versioned and visible in the editor.
        generate: (otherSources) => 'foo',
        serialize: (content) => content,
      },
      {
        type: 'object',
        path: 'path/to/file.json',
        generate: (otherSources) => ({foo: 'bar'}),
        serialize: (content) => JSON.stringify(content),
      },
      {
        type: 'unknown',
        path: 'path/to/file',
        editable: true, // The file should be visible in the editor.
      },
    ],
    dependencies: [
      {
        type: 'string',
        path: 'path/to/file.txt',
        generate: (content, otherSources) => content + 'bar',
      },
      {
        type: 'object',
        path: 'path/to/file.json',
        required: true,
        generate: (content, otherSources) => ({...content, baz: 'qux'}),
      },
      {
        type: 'any',
        path: 'path/to/file',
        required: true,
      },
    ],
  },
];
```

---

Copyright 2021 Clemens Akens. All rights reserved.
[MIT license](https://github.com/clebert/onecmd/blob/master/LICENSE.md).
