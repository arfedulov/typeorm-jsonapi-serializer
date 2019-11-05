import * as JSONAPI from 'jsonapi-typescript';

import { Constructor, EntityInstance } from '../types';

const getAttributes = (entity: EntityInstance, relationships: string[]) => {
  return Object.keys(entity).filter((key) => {
    return !key.startsWith('__') && key !== 'id' && key !== 'type' && !relationships.includes(key);
  });
};

export interface SerializerOptions {
  /** Map ORM porperty names to jsonapi resource types. */
  relationshipsTypes: { [key: string]: string };
  /** Field names to exclude from output. */
  exclude: string[];
}

/** Create jsonapi resource object from entity instance. */
export const serializeEntity = async (
  resourceType: string,
  entity: EntityInstance,
  options: SerializerOptions
) => {
  const {
    relationshipsTypes,
    exclude,
  } = options;
  const data = {
    id: entity.id + '',
    type: resourceType,
  } as JSONAPI.ResourceObject;
  const relationships = Object.keys(relationshipsTypes)
    .filter((key) => !exclude.includes(key));
  const attributes = getAttributes(entity, relationships || [])
    .filter((key) => !exclude.includes(key));

  if (attributes && attributes.length > 0) {
    data.attributes = attributes.reduce((acc, attr) => {
      acc[attr] = (entity as any)[attr];
      return acc;
    }, {} as any);
  }
  if (relationships && relationships.length > 0) {
    data.relationships = await relationships.reduce(async (acc, relKey) => {
      const relData = await (entity as any)[relKey];
      const prev = await acc;
      let next;
      if (Array.isArray(relData)) {
        next = {
          data: relData.map((element) => {
            return { id: element.id + '', type: relationshipsTypes![relKey] };
          }),
        };
      } else if (relData !== null) {
        next = {
          data: { id: relData.id + '', type: relationshipsTypes![relKey] },
        };
      } else {
        next = {
          data: null,
        };
      }

      return { ...prev, [relKey]: next };
    }, Promise.resolve({} as any));
  }

  return data;
};
