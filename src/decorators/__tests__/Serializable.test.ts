import assert from 'assert';
import 'reflect-metadata';

import { Serializable, SERIALIZABLE_META_KEY } from '../Serializable';

test('@Serializable: set "resourceType"', () => {
  const EXPECT = {
    resourceType: 'animals',
  };

  @Serializable(EXPECT.resourceType)
  class Animal {}

  const actual = Reflect.getMetadata(SERIALIZABLE_META_KEY, Animal);

  assert.deepStrictEqual(actual, EXPECT);
});

test('@Serializable: set "resourceType" and "skip"', () => {
  const EXPECT = {
    resourceType: 'animals',
    skip: [ 'a', 'b', 'c' ],
  };

  @Serializable(EXPECT.resourceType, { skip: EXPECT.skip })
  class Animal {}

  const actual = Reflect.getMetadata(SERIALIZABLE_META_KEY, Animal);

  assert.deepStrictEqual(actual, EXPECT);
});
