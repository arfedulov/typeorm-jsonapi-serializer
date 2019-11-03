import 'reflect-metadata';

import { SERIALIZABLE_META_KEY } from './Serializable';

const getSymbolName = (s: symbol) => {
  return s.toString().slice(7, -1);
};

export const Skip = (target: any, propertyKey: string | symbol) => {
  const meta = Reflect.getMetadata(SERIALIZABLE_META_KEY, target.constructor) || {};
  const updatedMeta = { ...meta };
  if (!meta.skip) {
    updatedMeta.skip = [];
  }
  if (updatedMeta.skip.indexOf(propertyKey) === -1) {
    const attr = typeof propertyKey === 'symbol' ? getSymbolName(propertyKey) : propertyKey;
    updatedMeta.skip = [ ...updatedMeta.skip, attr ];
    Reflect.defineMetadata(SERIALIZABLE_META_KEY, updatedMeta, target.constructor);
  }
};
