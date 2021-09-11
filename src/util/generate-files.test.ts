import {generateFiles} from './generate-files';

const isString = (content: unknown): content is string =>
  typeof content === 'string';

const isNumber = (content: unknown): content is number =>
  typeof content === 'number';

const serializeString = (content: string) => content.toUpperCase();

describe('generateFiles()', () => {
  test('several sources and dependencies', () => {
    const createA = jest.fn(() => 'a1');
    const updateA = jest.fn((content: string) => content + 'a2');
    const createB = jest.fn(() => 'b1');
    const updateB = jest.fn((content: string) => content + 'b2');
    const updateE = jest.fn();

    const files = generateFiles(
      [
        {
          type: 'managed',
          path: 'a',
          versionable: true,
          is: isString,
          create: createA,
          serialize: serializeString,
        },
        {
          type: 'managed',
          path: './b',
          is: isString,
          create: createB,
          serialize: serializeString,
        },
        {type: 'unmanaged', path: './c', versionable: true},
        {type: 'unmanaged', path: './d', editable: true},
      ],
      [
        {type: 'any', path: './a', required: true},
        {type: 'any', path: 'b', required: true},
        {type: 'any', path: './c', required: true},
        {type: 'any', path: './d', required: true},
        {
          type: 'managed',
          path: './a',
          required: true,
          is: isString,
          update: updateA,
        },
        {
          type: 'managed',
          path: 'b',
          required: true,
          is: isString,
          update: updateB,
        },
        {type: 'managed', path: './e', is: isString, update: updateE},
      ]
    );

    expect(files).toEqual([
      {filename: 'a', data: 'A1A2'},
      {filename: 'b', data: 'B1B2'},
    ]);

    expect(createA.mock.calls).toEqual([
      [
        {
          b: {editable: false, versionable: false},
          c: {editable: false, versionable: true},
          d: {editable: true, versionable: false},
        },
      ],
    ]);

    expect(updateA.mock.calls).toEqual([
      [
        'a1',
        {
          b: {editable: false, versionable: false},
          c: {editable: false, versionable: true},
          d: {editable: true, versionable: false},
        },
      ],
    ]);

    expect(createB.mock.calls).toEqual([
      [
        {
          a: {editable: false, versionable: true},
          c: {editable: false, versionable: true},
          d: {editable: true, versionable: false},
        },
      ],
    ]);

    expect(updateB.mock.calls).toEqual([
      [
        'b1',
        {
          a: {editable: false, versionable: true},
          c: {editable: false, versionable: true},
          d: {editable: true, versionable: false},
        },
      ],
    ]);

    expect(updateE.mock.calls).toEqual([]);
  });

  test('duplicate sources', () => {
    const sources = [
      {
        type: 'managed',
        path: './a',
        versionable: true,
        is: isString,
        create: () => '',
        serialize: serializeString,
      },
      {
        type: 'managed',
        path: 'a',
        versionable: true,
        is: isString,
        create: () => '',
        serialize: serializeString,
      },
      {type: 'unmanaged', path: './a'},
      {type: 'unmanaged', path: 'a'},
    ] as const;

    for (const source1 of sources) {
      for (const source2 of sources) {
        expect(() => generateFiles([source1, source2], [])).toThrow(
          new Error('File "a" already exists.')
        );
      }
    }
  });

  test('non-existing dependencies', () => {
    expect(() =>
      generateFiles([], [{type: 'any', path: './a', required: true}])
    ).toThrow(new Error('Required file "a" does not exist.'));

    expect(() =>
      generateFiles(
        [],
        [
          {
            type: 'managed',
            path: './a',
            required: true,
            is: isString,
            update: () => '',
          },
        ]
      )
    ).toThrow(new Error('Required file "a" does not exist.'));
  });

  test('incompatible dependencies', () => {
    expect(() =>
      generateFiles(
        [{type: 'unmanaged', path: './a'}],
        [{type: 'managed', path: 'a', is: isString, update: () => ''}]
      )
    ).toThrow(new Error('Unmanaged file "a" cannot be updated.'));

    expect(() =>
      generateFiles(
        [
          {
            type: 'managed',
            path: './a',
            versionable: true,
            is: isString,
            create: () => '',
            serialize: serializeString,
          },
        ],
        [{type: 'managed', path: 'a', is: isNumber, update: () => 0}]
      )
    ).toThrow(new Error('Incompatible file "a" cannot be updated.'));

    expect(() =>
      generateFiles(
        [
          {
            type: 'managed',
            path: './a',
            versionable: true,
            is: isString,
            create: () => '',
            serialize: serializeString,
          },
        ],
        [{type: 'managed', path: 'a', is: isString, update: () => 0}]
      )
    ).toThrow(new Error('Malformed file "a" cannot be serialized.'));
  });
});
