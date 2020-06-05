import { ValueMap, ValueType } from "./types";
import { BitStream } from "bit-buffer";
import _ from 'lodash';

export const fromBitBuffer = <T extends (new (...args: any[]) => {})>(constructor: T, buffer: Buffer | BitStream): InstanceType<T> => {
    const map: ValueMap[] = constructor.prototype._map;
    const bitStream = Buffer.isBuffer(buffer) ? new BitStream(buffer) : buffer;
    (<any>bitStream).bigEndian = true;
    const obj = new constructor()
    for (let i = 0; i < map?.length; i++) {
        const m = map[i];
        const value = this[m.prop] ?? 0;
        switch (m.type) {
            case ValueType.unsigned:
                obj[m.prop] = bitStream.readBits(m.size)
                break;
            case ValueType.signed:
                obj[m.prop] = bitStream.readBits(m.size, true)
                break;
            case ValueType.buffer:
                let nStream = bitStream.readBitStream(m.size);
                const mod = m.size % 8;
                const val = Buffer.from(nStream.readArrayBuffer(Math.ceil(m.size / 8)));
                if(mod != 0) {
                    let lastByte = val[val.length - 1];
                    val[val.length - 1] = lastByte & ~(Math.pow(2, mod) - 1);
                }
                    
                obj[m.prop] = val;
                break;
            default:
                obj[m.prop] = [];
                for(let i = 0; i < m.size; i++) 
                    obj[m.prop].push(fromBitBuffer(m.type, bitStream))
                break;
        }
    }
    return <InstanceType<T>>obj;
}

export const toBitBuffer = <T extends (new (...args: any[]) => {})>(obj: { [x: string]: any }, type?: T, bs?: BitStream): Buffer => {
    const map: ValueMap[] = type ? type.prototype._map : obj._map;

    const calcSize = (map: ValueMap[]) => {
        if (!map) return 0;
        return _.sumBy(map, x => {
            if (typeof x.type !== 'function')
                return x.size

            return calcSize(x.type.prototype._map) * x.size;
        });
    }
    const size = calcSize(map);
    const bitStream = bs ?? new BitStream(Buffer.alloc(Math.ceil(size / 8)));
    (<any>bitStream).bigEndian = true;
    for (let i = 0; i < map?.length; i++) {
        const m = map[i];
        const value = obj?.[m.prop] ?? 0;
        switch (m.type) {
            case ValueType.unsigned:
            case ValueType.signed:
                bitStream.writeBits(value, m.size);
                break;
            case ValueType.buffer:
                const nBitStream = new BitStream(new Uint8Array(value).buffer);
                (<any>nBitStream).bigEndian = true;
                bitStream.writeBitStream(nBitStream, m.size);
                break;
            default:
                for (let i = 0; i < value?.length && i < m.size; i++) {
                    const v = value[i];
                    if (m.type?.prototype?._map) {
                        toBitBuffer(v, m.type, bitStream);
                    }
                }
                break;
        }
    }
    return bitStream.buffer;
}