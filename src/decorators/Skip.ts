import { SERIALIZABLE_META_KEY } from './Serializable';
import { MetaData } from '../MetaData';

const getSymbolName = (s: symbol) => {
  return s.toString().slice(7, -1);
};

export interface SkipOptions {
  serialization?: boolean;
  deserialization?: boolean;
}

export const Skip = (options?: SkipOptions) => (target: any, propertyKey: string | symbol) => {
  const skipBoth = !options;
  const skipSerialization = (options && options.serialization) || skipBoth;
  const skipDeserialization = (options && options.deserialization) || skipBoth;

  const _meta: MetaData = Reflect.getMetadata(SERIALIZABLE_META_KEY, target.constructor) || {};
  const meta = { ..._meta };
  if (!meta.skipSerialization) {
    meta.skipSerialization = [];
  }
  if (!meta.skipDeserialization) {
    meta.skipDeserialization = [];
  }
  const attr = typeof propertyKey === 'symbol' ? getSymbolName(propertyKey) : propertyKey;
  if (skipSerialization && !meta.skipSerialization.includes(attr)) {
    meta.skipSerialization = [ ...meta.skipSerialization, attr ];
  }
  if (skipDeserialization && !meta.skipDeserialization.includes(attr)) {
    meta.skipDeserialization = [ ...meta.skipDeserialization, attr ];
  }
  Reflect.defineMetadata(SERIALIZABLE_META_KEY, meta, target.constructor);
};
