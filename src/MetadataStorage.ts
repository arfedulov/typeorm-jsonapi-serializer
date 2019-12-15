import { Class } from 'type-fest';
import remove from 'lodash/remove';

import { SERIALIZABLE_META_KEY } from './decorators/Serializable';
import { MetaData } from './MetaData';

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
    if (!this.entityConstructors.includes(ctor)) {
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

  getEntityCtorByResourceType = (resourceType: string) => {
    const ctor = this.entityConstructors.find((constructor) => {
      const meta: MetaData = Reflect.getMetadata(SERIALIZABLE_META_KEY, constructor);
      return meta && meta.resourceType === resourceType;
    });
    if (!ctor) {
      throw new Error(`Entity with resource type ${ resourceType } does not exist.`);
    }
    return ctor;
  }
}

export const __dropStorage = () => {
  globalObject[STORAGE_KEY] = null;
};
