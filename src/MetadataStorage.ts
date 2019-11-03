import { Class } from 'type-fest';
import remove from 'lodash/remove';

const STORAGE_KEY = Symbol('globalMetadataStorage');

const globalObject = global as any;

export class MetadataStorage {
  static getStorage(): MetadataStorage {
    if (!globalObject[STORAGE_KEY]) {
      globalObject[STORAGE_KEY] = new MetadataStorage();
    }
    return globalObject[STORAGE_KEY];
  }

  private entityConstructors: Class[];

  private constructor() {
    this.entityConstructors = [];
  }

  addEntityConstructor = (ctor: Class) => {
    if (this.entityConstructors.indexOf(ctor) === -1) {
      this.entityConstructors.push(ctor);
    }
  }

  removeEntityConstructor = (ctor: Class | string) => {
    const ctorName = typeof ctor === 'string' ? ctor : ctor.name;
    remove(this.entityConstructors, (el) => el.name === ctorName);
  }

  getEntityConstructors = () => {
    return [ ...this.entityConstructors ];
  }
}

export const __dropStorage = () => {
  globalObject[STORAGE_KEY] = null;
};
