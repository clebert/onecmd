# onecmd

[![][ci-badge]][ci-link] [![][version-badge]][version-link]
[![][license-badge]][license-link]

[ci-badge]: https://github.com/clebert/onecmd/workflows/CI/badge.svg
[ci-link]: https://github.com/clebert/onecmd
[version-badge]: https://badgen.net/npm/v/onecmd
[version-link]: https://www.npmjs.com/package/onecmd
[license-badge]: https://badgen.net/npm/license/onecmd
[license-link]: https://github.com/clebert/onecmd/blob/master/LICENSE.md

One command to `setup`, `compile`, `format`, `lint`, and `test` them all.

## Installation

```
npm install onecmd --save-dev
```

## Abstract

Inspired by the [configuration-free](https://golang.org/doc/articles/go_command)
approach of _Go_, **onecmd** should serve as a single tool to set up, compile,
format, lint, and test TypeScript or JavaScript projects.

## Rationale

The tools used and the associated configuration files are often identical in
projects of the same type. The jumble of configuration files distracts from the
actual content, and they are always tedious to create and keep up to date.
Furthermore, tools are often interrelated and require mutual adjustments in
their respective configurations. Standard conventions could be derived to set up
such projects in a uniform way.

Project templates are of little help, as they can often only be applied
initially and are difficult to adapt to the dynamic requirements of different
project types. Tools like _Create React App_ are specialized and cannot be used
generically for all projects.

## Getting started

**onecmd** serves as a generic tool for dynamic management of projects and is
fully customizable via user-defined plugins. A set of coordinated plugins based
on standard conventions could serve as a foundation for easy and consistent
project management with **onecmd**. One such attempt is the package
[`@onecmd/standard-plugins`](https://github.com/clebert/onecmd-standard-plugins).

### Usage

1. Install the standard plugins:
   `npm install @onecmd/standard-plugins --save-dev`
2. Create a file named `onecmd.js`:

```js
// @ts-check

const std = require('@onecmd/standard-plugins');

/** @type {readonly import('onecmd').Plugin[]} */
const plugins = [
  std.babel(),
  std.editorconfig(),
  std.eslint(),
  std.git(),
  std.jest({coverage: true}),
  std.node('16'),
  std.npm(),
  std.prettier(),
  std.typescript('node', 'package'),
  std.vscode({showFilesInEditor: false}),
];

module.exports = plugins;
```

3. Run: `onecmd setup`
4. Run: `onecmd compile && onecmd format --check && onecmd lint && onecmd test`

### Example plugin

```js
const plugin = {
  setup: () => [
    {
      type: 'new',
      path: 'path/to/file',
      attrs: {pretty: true, versioned: true, visible: true},
      is: (content) => typeof content === 'string',
      create: (otherFiles) => 'foo',
      serialize: (content) => content,
    },
    {
      type: 'mod',
      path: 'path/to/file',
      is: (content) => typeof content === 'string',
      update: (content, otherFiles) => content + 'bar',
    },
    {
      type: 'ref',
      path: 'path/to/file',
      attrs: {visible: true},
    },
  ],
  compile: ({watch}) => [
    {command: 'path/to/exe', args: ['--foo', watch ? '--bar' : undefined]},
  ],
  format: ({check}) => [
    {command: 'path/to/exe', args: ['--foo', check ? '--bar' : undefined]},
  ],
  lint: ({fix}) => [
    {command: 'path/to/exe', args: ['--foo', fix ? '--bar' : undefined]},
  ],
  test: ({watch}) => [
    {command: 'path/to/exe', args: ['--foo', watch ? '--bar' : undefined]},
  ],
};
```

---

Copyright 2021 Clemens Akens. All rights reserved.
[MIT license](https://github.com/clebert/onecmd/blob/master/LICENSE.md).
