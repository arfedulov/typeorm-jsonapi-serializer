export type Constructor<T = any> = Function;

export interface EntityInstance {
  id: string | number;
  constructor: Function;
}
