export enum ValueType {
  'signed',
  'unsigned',
  'buffer'
}

export interface ValueParam {
  size: number;
  type?:  (new(...args: any[]) => {}) | ValueType;
}

export interface ValueMap extends ValueParam {
  prop: string;
}

export interface TargetMap {
  _map?: ValueMap[];
  [x: string]: any;
}
