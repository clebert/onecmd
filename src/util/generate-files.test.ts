import {generateFiles} from './generate-files';

const serializeJson = (value: object) => JSON.stringify(value, null, 2) + '\n';
const serializeText = (value: readonly string[]) => value.join('\n') + '\n';
const any = {type: 'any', path: './a', required: true} as const;
const artifact = {type: 'artifact', path: './a'} as const;
const generate = async () => Promise.resolve([]);
const json = {type: 'json', path: './a', generate} as const;
const text = {type: 'text', path: './a', generate} as const;

describe('generateFiles()', () => {
  test('several sources and dependencies', async () => {
    const a1 = jest.fn(async () => Promise.resolve(['a1']));
    const b1 = jest.fn(async () => Promise.resolve(['b1']));
    const b2 = jest.fn(async (input) => Promise.resolve([...input, 'b2']));
    const c1 = jest.fn(async () => Promise.resolve(['c1']));
    const c2 = jest.fn(async (input) => Promise.resolve([...input, 'c2']));
    const c3 = jest.fn(async (input) => Promise.resolve([...input, 'c3']));
    const d2 = jest.fn(async (input) => Promise.resolve([...input, 'd2']));
    const e1 = jest.fn(async () => Promise.resolve(['e1']));
    const g2 = jest.fn(async (input) => Promise.resolve([...input, 'g2']));

    const files = await generateFiles(
      [
        {type: 'json', path: './a', generate: a1},
        {type: 'text', path: 'b', versioned: true, generate: b1},
        {type: 'json', path: './c', generate: c1},
        {type: 'text', path: './e', versioned: true, generate: e1},
        {type: 'artifact', path: './f'},
      ],
      [
        {type: 'any', path: './a', required: true},
        {type: 'text', path: './b', generate: b2, required: true},
        {type: 'json', path: 'c', generate: c2, required: true},
        {type: 'json', path: './c', generate: c3, required: true},
        {type: 'json', path: './d', generate: d2},
        {type: 'any', path: './e', required: true},
        {type: 'any', path: './f', required: true},
        {type: 'text', path: './g', generate: g2},
      ]
    );

    expect(files).toEqual([
      {filename: 'a', data: serializeJson(['a1'])},
      {filename: 'b', data: serializeText(['b1', 'b2'])},
      {filename: 'c', data: serializeJson(['c1', 'c2', 'c3'])},
      {filename: 'e', data: serializeText(['e1'])},
    ]);

    const i = {versioned: false};
    const v = {versioned: true};

    expect(a1.mock.calls).toEqual([[{b: v, c: i, e: v, f: i}]]);
    expect(b1.mock.calls).toEqual([[{a: i, c: i, e: v, f: i}]]);
    expect(b2.mock.calls).toEqual([[['b1'], {a: i, c: i, e: v, f: i}]]);
    expect(c1.mock.calls).toEqual([[{a: i, b: v, e: v, f: i}]]);
    expect(c2.mock.calls).toEqual([[['c1'], {a: i, b: v, e: v, f: i}]]);
    expect(c3.mock.calls).toEqual([[['c1', 'c2'], {a: i, b: v, e: v, f: i}]]);
    expect(d2.mock.calls).toEqual([]);
    expect(e1.mock.calls).toEqual([[{a: i, b: v, c: i, f: i}]]);
    expect(g2.mock.calls).toEqual([]);
  });

  test('duplicate sources', async () => {
    for (const source1 of [artifact, json, text]) {
      for (const source2 of [artifact, json, text]) {
        await expect(generateFiles([source1, source2], [])).rejects.toEqual(
          new Error('Source "a" already exists.')
        );
      }
    }
  });

  test('non-existing dependencies', async () => {
    await expect(generateFiles([], [any])).rejects.toEqual(
      new Error('Dependency "a" does not exist.')
    );

    await expect(
      generateFiles([], [{...json, required: true}])
    ).rejects.toEqual(new Error('Dependency "a" does not exist.'));

    await expect(
      generateFiles([], [{...text, required: true}])
    ).rejects.toEqual(new Error('Dependency "a" does not exist.'));
  });

  test('incompatible dependencies', async () => {
    await expect(generateFiles([artifact], [json])).rejects.toEqual(
      new Error('Dependency "a" should be of type "any" instead of "json".')
    );

    await expect(generateFiles([artifact], [text])).rejects.toEqual(
      new Error('Dependency "a" should be of type "any" instead of "text".')
    );

    await expect(generateFiles([json], [text])).rejects.toEqual(
      new Error('Dependency "a" should be of type "json" instead of "text".')
    );

    await expect(generateFiles([text], [json])).rejects.toEqual(
      new Error('Dependency "a" should be of type "text" instead of "json".')
    );
  });
});
