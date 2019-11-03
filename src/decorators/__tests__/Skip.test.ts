import assert from 'assert';
import 'reflect-metadata';

import { Skip } from '../Skip';
import { SERIALIZABLE_META_KEY, Serializable } from '../Serializable';

test('@Skip: add property to "skip" array', () => {
  const EXPECT_SKIP = [ 'a', 'b' ];

  @Serializable('animals', {
    skip: [ 'a' ],
  })
  class Animal {
    a = 'A';

    @Skip
    b = 'B';

    c = 'C';
  }

  const actual = Reflect.getMetadata(SERIALIZABLE_META_KEY, Animal);

  assert.strictEqual(actual.skip.length, EXPECT_SKIP.length);
  EXPECT_SKIP.forEach((attr) => {
    assert(actual.skip.indexOf(attr) !== -1);
  });
});

test('@Skip: add symbol property to "skip" array', () => {
  const B = Symbol('b');
  const EXPECT_SKIP = [ 'a', 'b' ];

  @Serializable('animals', {
    skip: [ 'a' ],
  })
  class Animal {
    a = 'A';

    @Skip
    [B] = 'B';

    c = 'C';
  }

  const actual = Reflect.getMetadata(SERIALIZABLE_META_KEY, Animal);

  assert.strictEqual(actual.skip.length, EXPECT_SKIP.length);
  EXPECT_SKIP.forEach((attr) => {
    assert(actual.skip.indexOf(attr) !== -1);
  });
});
