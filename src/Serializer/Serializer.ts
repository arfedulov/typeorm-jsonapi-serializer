import assert from 'assert';
import { getMetadataArgsStorage } from 'typeorm';

import { SERIALIZABLE_META_KEY, SerializableMetaData } from '../decorators/Serializable';
import { MetadataStorage } from '../MetadataStorage';
import { serializeEntity } from './serializeEntity';
import { Constructor, EntityInstance } from '../types';

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
  const metaStorage = getMetadataArgsStorage();
  const rels = metaStorage.relations.filter((rel) => equal(rel.target, entity.constructor));
  const options = {
    relationshipsTypes: {} as any,
    exclude: [] as string[],
  };
  (meta.skip || []).forEach((skipKey) => {
    options.exclude.push(skipKey);
  });
  rels.forEach((rel) => {
    const type: string | Constructor = typeof rel.type === 'string' ? rel.type : rel.type();
    let relConstructor;
    if (typeof type === 'string') {
      relConstructor = MetadataStorage.getStorage().getEntityConstructors().find((ctor) => {
        return ctor.name === type;
      }) as Constructor;
    } else {
      relConstructor = type;
    }
    const relMeta = Reflect.getMetadata(SERIALIZABLE_META_KEY, relConstructor) as SerializableMetaData;
    if (!relMeta) {
      // means relationsip is not serializable
      options.exclude.push(rel.propertyName);
    } else {
      options.relationshipsTypes[rel.propertyName] = relMeta.resourceType;
    }
  });
  return serializeEntity(meta.resourceType, entity, options);
};
