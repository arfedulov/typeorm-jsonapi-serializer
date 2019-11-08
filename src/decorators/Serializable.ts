import { Class } from 'type-fest';
import { MetadataStorage } from '../MetadataStorage';
import uniq from 'lodash/uniq';

import { LinkingEntityIdFields } from '../Deserializer/deserializeEntity';

export interface SerializableParams {
  skip?: string[];
}

export interface SerializableMetaData {
  resourceType: string;
  skip?: string[];
  linkingEntityIdFields?: LinkingEntityIdFields;
}

export const SERIALIZABLE_META_KEY = Symbol('custom:serializable');

export const Serializable = (resourceType: string, params?: SerializableParams) => (target: Class) => {
  const storage = MetadataStorage.getStorage();
  storage.addEntityConstructor(target);

  const meta = Reflect.getMetadata(SERIALIZABLE_META_KEY, target) || {};
  const updatedMeta = { ...meta, resourceType };
  if (params && params.skip) {
    updatedMeta.skip = uniq([ ...(updatedMeta.skip || []), ...params.skip ]);
  }
  Reflect.defineMetadata(SERIALIZABLE_META_KEY, updatedMeta, target);
};
