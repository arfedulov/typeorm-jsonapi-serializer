import assert from 'assert';

import { SERIALIZABLE_META_KEY } from '../decorators/Serializable';
import { serializeEntity } from './serializeEntity';
import { Constructor, EntityInstance } from '../types';
import { getRelationConstructors } from '../lib/getRelationConstructors';
import { MetaData } from '../MetaData';

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
  const meta: MetaData = Reflect.getMetadata(SERIALIZABLE_META_KEY, entity.constructor);
  assert(meta, 'Entity should be serializable and serializable intities must have metadata');
  const options = {
    relationshipsTypes: {} as any,
    exclude: [] as string[],
  };
  (meta.skipSerialization || []).forEach((skipKey) => {
    options.exclude.push(skipKey);
  });
  const relCtors = Object.entries(getRelationConstructors({ entityConstructor: entity.constructor as any }));
  relCtors.forEach(([propertyName, relConstructor]) => {
    const relMeta: MetaData = Reflect.getMetadata(SERIALIZABLE_META_KEY, relConstructor);
    if (!relMeta) {
      // means relationsip is not serializable
      options.exclude.push(propertyName);
    } else {
      options.relationshipsTypes[propertyName] = relMeta.resourceType;
    }
  });
  return serializeEntity(meta.resourceType, entity, options);
};
