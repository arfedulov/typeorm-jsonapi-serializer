import * as JSONAPI from 'jsonapi-typescript';
import lodash from 'lodash';

import { Constructor } from '../types';

/**
 * From and to foreign key names in linking entity.
 *
 * @example { subscribers: { from: 'userId', to: 'subscriberId' } }
 */
export interface LinkingEntityIdFields {
  [key: string]: { from: string, to: string };
}

export interface MetaInfo {
  ctorResourceType: string;
  relationshipsResourceTypes: { [key: string]: string };
}

export interface DeserializerOptions {
  /** Map ORM porperty names to entity constructors. */
  relationEntityConstructors: { [key: string]: Constructor };
  linkingEntityIdFields: LinkingEntityIdFields;
  metaInfo: MetaInfo;
}

/** Safely convert string id to number or leave as is ( in case it is uuid ). */
const toEntityId = (rawId: string) => lodash.isFinite(+rawId) ? +rawId : rawId;

/** Creates entity instances from jsonapi document. */
export const deserializeEntity = (
  entityConstructor: Constructor,
  data: JSONAPI.ResourceObject,
  options: DeserializerOptions
) => {
  const {
    relationEntityConstructors,
    linkingEntityIdFields,
    metaInfo,
  } = options;
  if (data.type !== metaInfo.ctorResourceType) {
    throw new Error('Resource type doesn\'t match the one defined in entity');
  }
  const { id, attributes, relationships } = data;
  const entity = new entityConstructor();
  if (id) {
    entity.id = toEntityId(id!);
  }
  if (attributes) {
    Object.keys(attributes).forEach((key) => {
      entity[key] = attributes[key];
    });
  }
  if (relationships) {
    Object.keys(relationships).forEach((key) => {
      if (!relationEntityConstructors[key]) {
        return;
      }
      if (Array.isArray((relationships[key] as JSONAPI.RelationshipsWithData).data)) {
        const relatedEntities = (relationships[key] as any).data.map((resource: any) => {
          const obj = new relationEntityConstructors[key]();
          if (linkingEntityIdFields[key]) {
            const { from, to } = linkingEntityIdFields[key];
            obj[from] = entity.id;
            obj[to] = resource.id;
          } else {
            if (resource.type !== metaInfo.relationshipsResourceTypes[key]) {
              throw new Error(
                `Relationship resource type doesn\'t match the one defined in entity (${ resource.type } !== ${ metaInfo.relationshipsResourceTypes[key] })`
              );
            }
            obj.id = resource.id;
          }
          return obj;
        });
        entity[key] = Promise.resolve(relatedEntities);
      } else {
        const obj = new relationEntityConstructors[key]();
        obj.id = toEntityId((relationships[key] as any).data.id);
        entity[key] = Promise.resolve(obj);
      }
    });
  }

  return entity;
};
