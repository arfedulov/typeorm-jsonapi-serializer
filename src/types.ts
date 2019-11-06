import { Class } from 'type-fest';

export type Constructor<T = any> = Class<T>;

export interface EntityInstance {
  id: string | number;
}
