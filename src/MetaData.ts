import { LinkingEntityIdFields } from './Deserializer/deserializeEntity';

// export type MetaData = Omit<SerializableMetaData, 'skip'>;
export interface MetaData {
  resourceType: string;
  /** Property names to skip from serialization. */
  skipSerialization?: string[];
  /** Property names to skip from deserialization. */
  skipDeserialization?: string[];
  linkingEntityIdFields?: LinkingEntityIdFields;
}
