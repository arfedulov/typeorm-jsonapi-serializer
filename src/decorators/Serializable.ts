import { Class } from 'type-fest';
import { MetadataStorage } from '../MetadataStorage';
import uniq from 'lodash/uniq';

import { MetaData } from '../MetaData';

export interface SerializableParams extends Pick<MetaData, 'skipDeserialization' | 'skipSerialization'> {
  skip: string[];
}

export const SERIALIZABLE_META_KEY = Symbol('custom:serializable');

export const Serializable = (resourceType: string, params?: SerializableParams) => (target: Class) => {
  const storage = MetadataStorage.getStorage();
  storage.addEntityConstructor(target);

  const _meta: MetaData = Reflect.getMetadata(SERIALIZABLE_META_KEY, target) || {};
  const meta = { ..._meta, resourceType };
  if (params && params.skip) {
    meta.skipSerialization = uniq([ ...(meta.skipSerialization || []), ...params.skip ]);
    meta.skipDeserialization = uniq([ ...(meta.skipDeserialization || []), ...params.skip ]);
  }
  if (params && params.skipSerialization) {
    meta.skipSerialization = uniq([ ...(meta.skipSerialization || []), ...params.skipSerialization ]);
  }
  if (params && params.skipDeserialization) {
    meta.skipDeserialization = uniq([ ...(meta.skipDeserialization || []), ...params.skipDeserialization ]);
  }
  Reflect.defineMetadata(SERIALIZABLE_META_KEY, meta, target);
};
