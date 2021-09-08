import {generateFiles} from './generate-files';

const any = {type: 'any', path: './a', required: true} as const;
const unknown = {type: 'unknown', path: './a'} as const;

const object = {
  type: 'object',
  path: 'a',
  required: true,
  generate: jest.fn(),
  serialize: jest.fn(),
} as const;

const string = {
  type: 'string',
  path: './a',
  required: true,
  generate: jest.fn(),
  serialize: jest.fn(),
} as const;

describe('generateFiles()', () => {
  test('several sources and dependencies', () => {
    const generateA1 = jest.fn(() => ['a1']);
    const generateA2 = jest.fn((input: string[]) => [...input, 'a2']);
    const generateB1 = jest.fn(() => 'b1');
    const generateB2 = jest.fn((input: string) => input + 'b2');
    const generateD = jest.fn();

    const files = generateFiles(
      [
        {
          type: 'object',
          path: './a',
          versioned: true,
          generate: generateA1,
          serialize: (input) => JSON.stringify(input).toUpperCase(),
        },
        {
          type: 'string',
          path: 'b',
          generate: generateB1,
          serialize: (input) => input.toUpperCase(),
        },
        {
          type: 'unknown',
          path: './c',
          versioned: true,
        },
      ],
      [
        {type: 'any', path: './a', required: true},
        {type: 'any', path: './b', required: true},
        {type: 'any', path: './c', required: true},
        {type: 'object', path: 'a', required: true, generate: generateA2},
        {type: 'object', path: './d', generate: generateD},
        {type: 'string', path: './b', required: true, generate: generateB2},
        {type: 'string', path: './d', generate: generateD},
      ]
    );

    expect(files).toEqual([
      {filename: 'a', data: '["A1","A2"]'},
      {filename: 'b', data: 'B1B2'},
    ]);

    const i = {versioned: false};
    const v = {versioned: true};

    expect(generateA1.mock.calls).toEqual([[{b: i, c: v}]]);
    expect(generateA2.mock.calls).toEqual([[['a1'], {b: i, c: v}]]);
    expect(generateB1.mock.calls).toEqual([[{a: v, c: v}]]);
    expect(generateB2.mock.calls).toEqual([['b1', {a: v, c: v}]]);
    expect(generateD.mock.calls).toEqual([]);
  });

  test('duplicate sources', () => {
    for (const source1 of [object, string, unknown]) {
      for (const source2 of [object, string, unknown]) {
        expect(() => generateFiles([source1, source2], [])).toThrow(
          new Error('Source "a" already exists.')
        );
      }
    }
  });

  test('non-existing dependencies', () => {
    expect(() => generateFiles([], [any])).toThrow(
      new Error('Dependency "a" does not exist.')
    );

    expect(() => generateFiles([], [object])).toThrow(
      new Error('Dependency "a" does not exist.')
    );

    expect(() => generateFiles([], [string])).toThrow(
      new Error('Dependency "a" does not exist.')
    );
  });

  test('incompatible dependencies', () => {
    expect(() => generateFiles([unknown], [object])).toThrow(
      new Error('Dependency "a" should be of type "any" instead of "object".')
    );

    expect(() => generateFiles([unknown], [string])).toThrow(
      new Error('Dependency "a" should be of type "any" instead of "string".')
    );

    expect(() => generateFiles([object], [string])).toThrow(
      new Error(
        'Dependency "a" should be of type "object" instead of "string".'
      )
    );

    expect(() => generateFiles([string], [object])).toThrow(
      new Error(
        'Dependency "a" should be of type "string" instead of "object".'
      )
    );
  });
});
