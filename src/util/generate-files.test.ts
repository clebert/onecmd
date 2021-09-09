import {generateFiles} from './generate-files';

const anyFile = {type: 'any', path: './a', required: true} as const;
const unknownFile = {type: 'unknown', path: './a'} as const;

const objectFile = {
  type: 'object',
  path: 'a',
  required: true,
  generate: jest.fn(),
  serialize: jest.fn(),
} as const;

const stringFile = {
  type: 'string',
  path: './a',
  required: true,
  generate: jest.fn(),
  serialize: jest.fn(),
} as const;

describe('generateFiles()', () => {
  test('several sources and dependencies', () => {
    const generateA1 = jest.fn(() => ['a1']);
    const generateA2 = jest.fn((content: string[]) => [...content, 'a2']);
    const generateB1 = jest.fn(() => 'b1');
    const generateB2 = jest.fn((content: string) => content + 'b2');
    const generateE = jest.fn();

    const files = generateFiles(
      [
        {
          type: 'object',
          path: './a',
          versionable: true,
          generate: generateA1,
          serialize: (content) => JSON.stringify(content).toUpperCase(),
        },
        {
          type: 'string',
          path: 'b',
          generate: generateB1,
          serialize: (content) => content.toUpperCase(),
        },
        {type: 'unknown', path: './c', versionable: true},
        {type: 'unknown', path: './d', editable: true},
      ],
      [
        {type: 'any', path: './a', required: true},
        {type: 'any', path: './b', required: true},
        {type: 'any', path: './c', required: true},
        {type: 'object', path: 'a', required: true, generate: generateA2},
        {type: 'object', path: './e', generate: generateE},
        {type: 'string', path: './b', required: true, generate: generateB2},
        {type: 'string', path: './e', generate: generateE},
      ]
    );

    expect(files).toEqual([
      {filename: 'a', data: '["A1","A2"]'},
      {filename: 'b', data: 'B1B2'},
    ]);

    expect(generateA1.mock.calls).toEqual([
      [
        {
          b: {editable: false, versionable: false},
          c: {editable: false, versionable: true},
          d: {editable: true, versionable: false},
        },
      ],
    ]);

    expect(generateA2.mock.calls).toEqual([
      [
        ['a1'],
        {
          b: {editable: false, versionable: false},
          c: {editable: false, versionable: true},
          d: {editable: true, versionable: false},
        },
      ],
    ]);

    expect(generateB1.mock.calls).toEqual([
      [
        {
          a: {editable: false, versionable: true},
          c: {editable: false, versionable: true},
          d: {editable: true, versionable: false},
        },
      ],
    ]);

    expect(generateB2.mock.calls).toEqual([
      [
        'b1',
        {
          a: {editable: false, versionable: true},
          c: {editable: false, versionable: true},
          d: {editable: true, versionable: false},
        },
      ],
    ]);

    expect(generateE.mock.calls).toEqual([]);
  });

  test('duplicate sources', () => {
    for (const source1 of [objectFile, stringFile, unknownFile]) {
      for (const source2 of [objectFile, stringFile, unknownFile]) {
        expect(() => generateFiles([source1, source2], [])).toThrow(
          new Error('Source "a" already exists.')
        );
      }
    }
  });

  test('non-existing dependencies', () => {
    expect(() => generateFiles([], [anyFile])).toThrow(
      new Error('Dependency "a" does not exist.')
    );

    expect(() => generateFiles([], [objectFile])).toThrow(
      new Error('Dependency "a" does not exist.')
    );

    expect(() => generateFiles([], [stringFile])).toThrow(
      new Error('Dependency "a" does not exist.')
    );
  });

  test('incompatible dependencies', () => {
    expect(() => generateFiles([unknownFile], [objectFile])).toThrow(
      new Error('Dependency "a" should be of type "any" instead of "object".')
    );

    expect(() => generateFiles([unknownFile], [stringFile])).toThrow(
      new Error('Dependency "a" should be of type "any" instead of "string".')
    );

    expect(() => generateFiles([objectFile], [stringFile])).toThrow(
      new Error(
        'Dependency "a" should be of type "object" instead of "string".'
      )
    );

    expect(() => generateFiles([stringFile], [objectFile])).toThrow(
      new Error(
        'Dependency "a" should be of type "string" instead of "object".'
      )
    );
  });
});
