import * as JSONAPI from 'jsonapi-typescript';

export interface DeserializeRelationshipParams {
  resourceObj: any;
  relationshipName: string;
  data: JSONAPI.ResourceLinkage;
  relationshipCtor: any;
  eager: boolean;
}

export const deserializeRelationship = (params: DeserializeRelationshipParams) => {
  const {
    relationshipName,
    data,
    relationshipCtor,
    resourceObj,
    eager,
  } = params;

  if (!data) {
    return;
  }

  if (Array.isArray(data)) {
    throw new Error('`to-many` relationship is not supported');
  }

  const rel = new relationshipCtor();
  rel.id = isFinite(+data.id) ? +data.id : data.id;

  (resourceObj as any)[relationshipName] = eager ? rel : Promise.resolve(rel);
  return resourceObj;
};
