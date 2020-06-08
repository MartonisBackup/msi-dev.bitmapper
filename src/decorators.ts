import { BitStream, BitView } from 'bit-buffer'
import { ValueMap, ValueType, TargetMap, ValueParam } from './types';
import { fromBitBuffer, toBitBuffer } from './mapper';
// import { HeaderType, ValueType, Value } from "./binaryMap";

// export interface BitMappable<T> {
//     static fromBitBuffer(buffer: Buffer) : InstanceType<T>
// }

export function bitMappable<T extends { new(...args: any[]): {} }>(type: T) {
    return class extends type {
        _map: ValueMap[];
        static fromBitBuffer(buffer: Buffer) {
           return fromBitBuffer(buffer, { type: bitMappable(type) });
        }

        toBitBuffer(): Buffer {

            return toBitBuffer(this, { type: type });
        }
    }
}

export function value({ size, type = ValueType.unsigned } : ValueParam) {
    return (target: TargetMap, prop: string) => {
        target._map = target._map ?? [];
        target._map.push({ prop, size, type: typeof type === 'function' ? bitMappable(type) : type });
    }
}
