import assert from 'assert';
import { getMetadataArgsStorage } from 'typeorm';

import { SERIALIZABLE_META_KEY, SerializableMetaData } from '../decorators/Serializable';
import { MetadataStorage } from '../MetadataStorage';
import { serializeEntity } from './serializeEntity';
import { Constructor, EntityInstance } from '../types';
import { getRelationConstructors } from '../lib/getRelationConstructors';

export interface SerializerParams {
  /** Keys to include into jsonapi "included" object. */
  include?: string[];
}

const equal = (a: any, b: Constructor) => {
  if (typeof a === 'string') {
    return a === b.name;
  }
  return a === b;
};

/** Creates preconfigured serializer function. */
export const Serializer = (params?: SerializerParams) => async (entity: EntityInstance) => {
  const meta = Reflect.getMetadata(SERIALIZABLE_META_KEY, entity.constructor) as SerializableMetaData;
  assert(meta, 'Entity should be serializable and serializable intities must have metadata');
  const options = {
    relationshipsTypes: {} as any,
    exclude: [] as string[],
  };
  (meta.skip || []).forEach((skipKey) => {
    options.exclude.push(skipKey);
  });
  const relCtors = Object.entries(getRelationConstructors({ entityConstructor: entity.constructor as any }));
  relCtors.forEach(([propertyName, relConstructor]) => {
    const relMeta = Reflect.getMetadata(SERIALIZABLE_META_KEY, relConstructor) as SerializableMetaData;
    if (!relMeta) {
      // means relationsip is not serializable
      options.exclude.push(propertyName);
    } else {
      options.relationshipsTypes[propertyName] = relMeta.resourceType;
    }
  });
  return serializeEntity(meta.resourceType, entity, options);
};
