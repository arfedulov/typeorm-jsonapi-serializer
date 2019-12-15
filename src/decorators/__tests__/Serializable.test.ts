import assert from 'assert';
import 'reflect-metadata';

import { Serializable, SERIALIZABLE_META_KEY } from '../Serializable';
import { MetaData } from '../../MetaData';

test('@Serializable: set "resourceType"', () => {
  const EXPECT: MetaData = {
    resourceType: 'animals',
  };

  @Serializable(EXPECT.resourceType)
  class Animal {}

  const actual = Reflect.getMetadata(SERIALIZABLE_META_KEY, Animal);

  assert.deepStrictEqual(actual, EXPECT);
});

test('@Serializable: set "resourceType" and "skipSerialization" and "skipDeserialization"', () => {
  const SKIP_FIELDS = [ 'a', 'b', 'c' ];
  const EXPECT: MetaData = {
    resourceType: 'animals',
    skipSerialization: SKIP_FIELDS,
    skipDeserialization: SKIP_FIELDS,
  };

  @Serializable(EXPECT.resourceType, { skip: SKIP_FIELDS })
  class Animal {}

  const actual = Reflect.getMetadata(SERIALIZABLE_META_KEY, Animal);

  assert.deepStrictEqual(actual, EXPECT);
});
