import { BitStream, BitView } from 'bit-buffer'
import { ValueMap, ValueType, TargetMap, ValueParam } from './types';
import { fromBitBuffer, toBitBuffer } from './mapper';
// import { HeaderType, ValueType, Value } from "./binaryMap";

export function bitMappable<T extends { new(...args: any[]): {} }>(constructor: T) {
    return class extends constructor {
        private _map: ValueMap[];
        static fromBitBuffer(buffer: Buffer) : InstanceType<T> {
           return fromBitBuffer(constructor, buffer);
        }

        toBitBuffer(): Buffer {
            return toBitBuffer(this, constructor);
        }
    }
}

export function value({ size, type = ValueType.unsigned } : ValueParam) {
    return (target: TargetMap, prop: string) => {
        target._map = target._map ?? [];
        target._map.push({ prop, size, type: typeof type === 'function' ? bitMappable(type) : type });
    }
}
