import * as JSONAPI from 'jsonapi-typescript';

import { getRelationConstructors, RelationConstructors } from '../lib/getRelationConstructors';
import { MetadataStorage } from '../MetadataStorage';
import { logger } from '../logger';
import { deserializeEntity } from './deserializeEntity';
import { SERIALIZABLE_META_KEY, SerializableMetaData } from '../decorators/Serializable';

const validJsonapiResourceObject = (data: JSONAPI.ResourceObject) => {
  return data.type && typeof data.type === 'string';
};

/** Creates deserializer function. */
export const Deserializer = (params?: any) => (data: JSONAPI.ResourceObject) => {
  if (data === null) {
    return;
  }
  if (!validJsonapiResourceObject(data)) {
    throw new Error('Expect valid jsonapi resource object');
  }
  const ctor = MetadataStorage.getStorage().getEntityCtorByResourceType(data.type);
  let relCtors: RelationConstructors = {};
  let linkingEntityIdFields = {};
  const meta = Reflect.getMetadata(SERIALIZABLE_META_KEY, ctor) as SerializableMetaData;
  if (data.relationships) {
    relCtors = getRelationConstructors({ resourceType: data.type });
    Object.keys(data.relationships).forEach((key) => {
      if (!relCtors[key]) {
        logger.warn(`No entity constructor for relationship ${ key }`);
      }
    });
    if (meta.linkingEntityIdFields) {
      linkingEntityIdFields = meta.linkingEntityIdFields;
    }
  }
  return deserializeEntity(ctor, data, {
    relationEntityConstructors: relCtors,
    linkingEntityIdFields,
    metaInfo: {
      ctorResourceType: meta.resourceType,
      relationshipsResourceTypes: Object.entries(relCtors).reduce((acc, [ key, relCtor ]) => {
        const relMeta = Reflect.getMetadata(SERIALIZABLE_META_KEY, relCtor) as SerializableMetaData;
        if (relMeta) {
          return { ...acc, [key]: relMeta.resourceType };
        }
        return { ...acc };
      }, {} as any),
    },
  });
};
