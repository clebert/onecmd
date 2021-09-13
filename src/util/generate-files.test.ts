import {generateFiles} from './generate-files';

const isString = (content: unknown): content is string =>
  typeof content === 'string';

const isNumber = (content: unknown): content is number =>
  typeof content === 'number';

const serialize = (content: string) => content.toUpperCase();

describe('generateFiles()', () => {
  test('file paths', () => {
    expect(() => generateFiles([{type: 'ref', path: '/path/to/a'}])).toThrow(
      new Error('The path to file "/path/to/a" must be relative.')
    );

    expect(() => generateFiles([{type: 'ref', path: './path/to/a'}])).toThrow(
      new Error('The path to file "./path/to/a" must be normalized.')
    );

    expect(() => generateFiles([{type: 'ref', path: 'path/to/../a'}])).toThrow(
      new Error('The path to file "path/to/../a" must be normalized.')
    );

    expect(() => generateFiles([{type: 'ref', path: ''}])).toThrow(
      new Error('The path to file "" must be normalized.')
    );

    expect(() =>
      generateFiles([{type: 'ref', path: 'path/to/a'}])
    ).not.toThrow();

    expect(() =>
      generateFiles([{type: 'ref', path: '../path/to/a'}])
    ).not.toThrow();
  });

  test('file ops', () => {
    const createA = jest.fn(() => 'a1');
    const createB = jest.fn(() => 'b1');
    const updateA = jest.fn((content: string) => content + 'a2');
    const updateB = jest.fn((content: string) => content + 'b2');
    const updateC = jest.fn();
    const is = isString;
    const pretty = {attrs: {pretty: true}};
    const versioned = {attrs: {versioned: true}};
    const visible = {attrs: {visible: true}};

    const blobs = generateFiles([
      {type: 'mod', path: 'a', is, update: updateA},
      {type: 'mod', path: 'b', is, update: updateB},
      {type: 'mod', path: 'c', is, update: updateC},
      {type: 'new', path: 'a', is, serialize, create: createA, ...pretty},
      {type: 'new', path: 'b', is, serialize, create: createB, ...versioned},
      {type: 'ref', path: 'd', ...visible},
      {type: 'ref', path: 'e'},
    ]);

    expect(blobs).toEqual([
      {path: 'a', data: 'A1A2'},
      {path: 'b', data: 'B1B2'},
    ]);

    expect(createA.mock.calls).toEqual([
      [{b: versioned.attrs, d: visible.attrs, e: {}}],
    ]);

    expect(createB.mock.calls).toEqual([
      [{a: pretty.attrs, d: visible.attrs, e: {}}],
    ]);

    expect(updateA.mock.calls).toEqual([
      ['a1', {b: versioned.attrs, d: visible.attrs, e: {}}],
    ]);

    expect(updateB.mock.calls).toEqual([
      ['b1', {a: pretty.attrs, d: visible.attrs, e: {}}],
    ]);

    expect(updateC.mock.calls).toEqual([]);
  });

  test('conflicting file ops', () => {
    const files = [
      {type: 'new', path: 'a', is: isString, serialize, create: () => ''},
      {type: 'ref', path: 'a'},
    ] as const;

    for (const file1 of files) {
      for (const file2 of files) {
        expect(() => generateFiles([file1, file2])).toThrow(
          new Error('The file "a" can be created or referenced only once.')
        );
      }
    }

    expect(() =>
      generateFiles([
        {type: 'ref', path: 'a'},
        {type: 'mod', path: 'a', is: isString, update: () => ''},
      ])
    ).toThrow(
      new Error('The file "a" is only referenced and cannot be modified.')
    );

    expect(() =>
      generateFiles([
        {type: 'new', path: 'a', is: isString, serialize, create: () => ''},
        {type: 'mod', path: 'a', is: isNumber, update: () => 0},
      ])
    ).toThrow(
      new Error(
        'The content of file "a" is incompatible and cannot be modified.'
      )
    );

    expect(() =>
      generateFiles([
        {type: 'new', path: 'a', is: isString, serialize, create: () => ''},
        {type: 'mod', path: 'a', is: isString, update: () => 0},
      ])
    ).toThrow(new Error('The content of file "a" is malformed.'));
  });
});
