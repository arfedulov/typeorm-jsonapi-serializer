import * as JSONAPI from 'jsonapi-typescript';

import { getRelationConstructors, RelationConstructors } from '../lib/getRelationConstructors';
import { MetadataStorage } from '../MetadataStorage';
import { logger } from '../logger';
import { deserializeEntity } from './deserializeEntity';
import { SERIALIZABLE_META_KEY } from '../decorators/Serializable';
import { MetaData } from '../MetaData';
import { DeserializeRelationshipParams, deserializeRelationship } from './deserializeRelation';

const validJsonapiResourceObject = (data: JSONAPI.ResourceObject) => {
  return data.type && typeof data.type === 'string';
};

const validJsonapiLinkageObject = (data: JSONAPI.ResourceLinkage) => {
  let valid = true;
  if (data === null) {
    return valid;
  }
  if (Array.isArray(data)) {
    for (const res of data) {
      if (!res.id || !res.type) {
        valid = false;
        break;
      }
    }
  } else {
    valid = !!(data.id && data.type);
  }
  return valid;
};

export interface DeserializerOptions {
  /** If present, deserialize relationship. */
  relationship?: DeserializeRelationshipParams;
}

/** Creates deserializer function. */
export const Deserializer = (params?: any) => (
  data: JSONAPI.ResourceObject | JSONAPI.ResourceLinkage,
  options?: DeserializerOptions) =>
{
  if (data === null) {
    return;
  }
  if (options && options.relationship) {
    // deserialize relationship
    if (!validJsonapiLinkageObject(data as JSONAPI.ResourceLinkage)) {
      throw new Error('Expect valid jsonapi resource linkage object');
    }
    return deserializeRelationship(options.relationship);
  }

  // deserialize resource object
  data = data as JSONAPI.ResourceObject;
  if (!validJsonapiResourceObject(data)) {
    throw new Error('Expect valid jsonapi resource object');
  }
  const ctor = MetadataStorage.getStorage().getEntityCtorByResourceType(data.type);
  let relCtors: RelationConstructors = {};
  let linkingEntityIdFields = {};
  const meta: MetaData = Reflect.getMetadata(SERIALIZABLE_META_KEY, ctor);
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
        const relMeta: MetaData = Reflect.getMetadata(SERIALIZABLE_META_KEY, relCtor);
        if (relMeta) {
          return { ...acc, [key]: relMeta.resourceType };
        }
        return { ...acc };
      }, {} as any),
    },
  });
};
