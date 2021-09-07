import {generateFiles} from './generate-files';
import {serialize} from './serialize';

const any = {type: 'any', path: './a', required: true} as const;
const artifact = {type: 'artifact', path: './a'} as const;
const generate = async () => Promise.resolve([]);
const json = {type: 'json', path: './a', generate} as const;
const yaml = {type: 'yaml', path: './a', generate} as const;
const text = {type: 'text', path: './a', generate} as const;

describe('generateFiles()', () => {
  test('several sources and dependencies', async () => {
    const b1 = jest.fn(async () => Promise.resolve(['b1']));
    const b2 = jest.fn(async (input) => Promise.resolve([...input, 'b2']));
    const c1 = jest.fn(async () => Promise.resolve(['c1']));
    const c2 = jest.fn(async (input) => Promise.resolve([...input, 'c2']));
    const d1 = jest.fn(async () => Promise.resolve(['d1']));
    const d2 = jest.fn(async (input) => Promise.resolve([...input, 'd2']));
    const e2 = jest.fn(async (input) => Promise.resolve([...input, 'e2']));

    const files = await generateFiles(
      [
        {type: 'artifact', path: './a', versioned: true},
        {type: 'json', path: './b', generate: b1},
        {type: 'yaml', path: './c', versioned: true, generate: c1},
        {type: 'text', path: './d', generate: d1},
      ],
      [
        {type: 'any', path: './a', required: true},
        {type: 'any', path: './b', required: true},
        {type: 'any', path: './c', required: true},
        {type: 'any', path: './d', required: true},
        {type: 'json', path: './b', generate: b2, required: true},
        {type: 'json', path: './e', generate: e2},
        {type: 'yaml', path: './c', generate: c2, required: true},
        {type: 'yaml', path: './e', generate: e2},
        {type: 'text', path: './d', generate: d2, required: true},
        {type: 'text', path: './e', generate: e2},
      ]
    );

    expect(files).toEqual([
      {filename: 'b', data: serialize('json', ['b1', 'b2'])},
      {filename: 'c', data: serialize('yaml', ['c1', 'c2'])},
      {filename: 'd', data: serialize('text', ['d1', 'd2'])},
    ]);

    const i = {versioned: false};
    const v = {versioned: true};

    expect(b1.mock.calls).toEqual([[{a: v, c: v, d: i}]]);
    expect(b2.mock.calls).toEqual([[['b1'], {a: v, c: v, d: i}]]);
    expect(c1.mock.calls).toEqual([[{a: v, b: i, d: i}]]);
    expect(c2.mock.calls).toEqual([[['c1'], {a: v, b: i, d: i}]]);
    expect(d1.mock.calls).toEqual([[{a: v, b: i, c: v}]]);
    expect(d2.mock.calls).toEqual([[['d1'], {a: v, b: i, c: v}]]);
    expect(e2.mock.calls).toEqual([]);
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
      generateFiles([], [{...yaml, required: true}])
    ).rejects.toEqual(new Error('Dependency "a" does not exist.'));

    await expect(
      generateFiles([], [{...text, required: true}])
    ).rejects.toEqual(new Error('Dependency "a" does not exist.'));
  });

  test('incompatible dependencies', async () => {
    await expect(generateFiles([artifact], [json])).rejects.toEqual(
      new Error('Dependency "a" should be of type "any" instead of "json".')
    );

    await expect(generateFiles([artifact], [yaml])).rejects.toEqual(
      new Error('Dependency "a" should be of type "any" instead of "yaml".')
    );

    await expect(generateFiles([artifact], [text])).rejects.toEqual(
      new Error('Dependency "a" should be of type "any" instead of "text".')
    );

    await expect(generateFiles([json], [yaml])).rejects.toEqual(
      new Error('Dependency "a" should be of type "json" instead of "yaml".')
    );

    await expect(generateFiles([json], [text])).rejects.toEqual(
      new Error('Dependency "a" should be of type "json" instead of "text".')
    );

    await expect(generateFiles([yaml], [json])).rejects.toEqual(
      new Error('Dependency "a" should be of type "yaml" instead of "json".')
    );

    await expect(generateFiles([yaml], [text])).rejects.toEqual(
      new Error('Dependency "a" should be of type "yaml" instead of "text".')
    );

    await expect(generateFiles([text], [json])).rejects.toEqual(
      new Error('Dependency "a" should be of type "text" instead of "json".')
    );

    await expect(generateFiles([text], [yaml])).rejects.toEqual(
      new Error('Dependency "a" should be of type "text" instead of "yaml".')
    );
  });
});
