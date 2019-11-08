import { getMetadataArgsStorage } from 'typeorm';
import assert from 'assert';
import { RequireExactlyOne } from 'type-fest';

import { MetadataStorage } from '../MetadataStorage';
import { Constructor } from '../types';

const equal = (a: any, b: Constructor) => {
  if (typeof a === 'string') {
    return a === b.name;
  }
  return a === b;
};

export type GetRelationConstructorsParams = RequireExactlyOne<{
  resourceType: string;
  entityConstructor: Constructor;
}>;

export interface RelationConstructors {
  [key: string]: Constructor;
}

export const getRelationConstructors = (params: GetRelationConstructorsParams) => {
  const {
    resourceType,
    entityConstructor: _entityCtor,
  } = params;
  const entityConstructor =
    _entityCtor || MetadataStorage.getStorage().getEntityCtorByResourceType(resourceType as string);
  assert(entityConstructor);

  const metaStorage = getMetadataArgsStorage();
  const rels = metaStorage.relations.filter((rel) => equal(rel.target, entityConstructor));

  return rels.reduce((acc, rel) => {
    const type: string | Constructor = typeof rel.type === 'string' ? rel.type : rel.type();
    let relConstructor;
    if (typeof type === 'string') {
      relConstructor = MetadataStorage.getStorage().getEntityConstructors().find((ctor) => {
        return ctor.name === type;
      }) as Constructor;
    } else {
      relConstructor = type;
    }
    return { ...acc, [rel.propertyName]: relConstructor };
  }, {} as RelationConstructors);
};
