import * as JSONAPI from 'jsonapi-typescript';

export interface DeserializeRelationshipParams {
  resourceObj: any;
  relationshipName: string;
  data: JSONAPI.ResourceLinkage;
  relationshipCtor: any;
}

export const deserializeRelationship = async (params: DeserializeRelationshipParams) => {
  const {
    relationshipName,
    data,
    relationshipCtor,
    resourceObj,
  } = params;

  if (!data) {
    return;
  }

  if (Array.isArray(data)) {
    throw new Error('`to-many` relationship is not supported');
  }

  const rel = new relationshipCtor();
  rel.id = isFinite(+data.id) ? +data.id : data.id;

  (resourceObj as any)[relationshipName] = rel;
  return resourceObj;
};
