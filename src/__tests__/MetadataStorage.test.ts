import assert from 'assert';
import { Entity, PrimaryGeneratedColumn } from 'typeorm';
import 'reflect-metadata';

import { MetadataStorage, __dropStorage } from '../MetadataStorage';
import { SERIALIZABLE_META_KEY} from '../decorators/Serializable';

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

test('getEntityCtorByResourceType(): return constructor by resource type', () => {
  class A {}
  class B {}
  class C {}
  Reflect.defineMetadata(SERIALIZABLE_META_KEY, { resourceType: 'typeA' }, A);
  Reflect.defineMetadata(SERIALIZABLE_META_KEY, { resourceType: 'typeB' }, B);
  Reflect.defineMetadata(SERIALIZABLE_META_KEY, { resourceType: 'typeC' }, C);

  [A, B, C].forEach((ctor) => MetadataStorage.getStorage().addEntityConstructor(ctor));

  const EXPECT = B;
  const actual = MetadataStorage.getStorage().getEntityCtorByResourceType('typeB');

  assert.strictEqual(actual, EXPECT);
});
