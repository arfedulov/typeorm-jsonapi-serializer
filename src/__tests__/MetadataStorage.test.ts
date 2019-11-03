import assert from 'assert';

import { MetadataStorage, __dropStorage } from '../MetadataStorage';

beforeEach(() => {
  __dropStorage();
});

test('getStorage(): always return same instance', () => {
  const storageA = MetadataStorage.getStorage();
  const storageB = MetadataStorage.getStorage();

  assert.strictEqual(storageA, storageB);
});

test('getEntityConstructors(): mutators don\'t affect internal array', () => {
  const storage = MetadataStorage.getStorage();
  const Mock0 = (() => {}) as any;
  const Mock1 = (() => {}) as any;
  storage.addEntityConstructor(Mock0);
  storage.addEntityConstructor(Mock1);

  const EXPECT = [ Mock0, Mock1 ];

  const actualBefore = storage.getEntityConstructors();
  assert.deepStrictEqual(actualBefore, EXPECT);

  actualBefore.pop();
  const actualAfterPop = storage.getEntityConstructors();
  assert.deepStrictEqual(actualAfterPop, EXPECT);

  actualAfterPop.push((() => {}) as any);
  const actualAfterPush = storage.getEntityConstructors();
  assert.deepStrictEqual(actualAfterPush, EXPECT);
});

test('addEntityConstructor(): add constructor', () => {
  const storage = MetadataStorage.getStorage();
  const Mock0 = (() => {}) as any;

  const EXPECT = [ Mock0 ];

  const actualBeforeAdd = storage.getEntityConstructors();
  assert.deepStrictEqual(actualBeforeAdd, []);

  storage.addEntityConstructor(Mock0);

  const actualAfterAdd = storage.getEntityConstructors();
  assert.deepStrictEqual(actualAfterAdd, EXPECT);
});

test('removeEntityConstructor(): remove constructor by reference', () => {
  const storage = MetadataStorage.getStorage();
  const Mock0 = (() => {}) as any;
  const Mock1 = (() => {}) as any;
  const Mock2 = (() => {}) as any;
  const Mock3 = (() => {}) as any;

  const INITIAL = [ Mock0, Mock1, Mock2, Mock3, ];
  const EXPECT = [ Mock0, Mock1, Mock3, ];

  INITIAL.forEach((ctor) => {
    storage.addEntityConstructor(ctor);
  });
  const actualBeforeRemove = storage.getEntityConstructors();
  assert.deepStrictEqual(actualBeforeRemove, [ Mock0, Mock1, Mock2, Mock3, ]);

  storage.removeEntityConstructor(Mock2);

  const actualAfterRemove = storage.getEntityConstructors();
  assert.deepStrictEqual(actualAfterRemove, EXPECT);
});

test('removeEntityConstructor(): remove constructor by name', () => {
  const storage = MetadataStorage.getStorage();
  const Mock0 = (() => {}) as any;
  const Mock1 = (() => {}) as any;
  const Mock2 = (() => {}) as any;
  const Mock3 = (() => {}) as any;

  const INITIAL = [ Mock0, Mock1, Mock2, Mock3, ];
  const EXPECT = [ Mock0, Mock1, Mock3, ];

  INITIAL.forEach((ctor) => {
    storage.addEntityConstructor(ctor);
  });
  const actualBeforeRemove = storage.getEntityConstructors();
  assert.deepStrictEqual(actualBeforeRemove, [ Mock0, Mock1, Mock2, Mock3, ]);

  storage.removeEntityConstructor('Mock2');

  const actualAfterRemove = storage.getEntityConstructors();
  assert.deepStrictEqual(actualAfterRemove, EXPECT);
});
