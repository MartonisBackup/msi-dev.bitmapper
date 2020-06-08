import { ValueMap, ValueType } from "./types";
import { BitStream } from "bit-buffer";
import _ from 'lodash';
import { bitMappable } from "./decorators";

export const fromBitBuffer = <T extends (new (...args: any[]) => {[x:string]: any})>(buffer: Buffer | BitStream, { type, bitmap }:{ type?: T, bitmap?: ValueMap[] }): InstanceType<T> => {
    const map: ValueMap[] = bitmap ?? (<T>type)?.prototype?._map ??  (<any>type)?._map;
    if(!map?.length)
        throw 'NO BITMAP FOUND';

    const bitStream = Buffer.isBuffer(buffer) ? new BitStream(buffer) : buffer;
    (<any>bitStream).bigEndian = true;
    const obj = type && typeof type === 'function' ? new type() : {};
    for (let i = 0; i < map?.length; i++) {
        const m = map[i];
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
                    obj[m.prop].push(fromBitBuffer(bitStream, { type: m.type }))
                break;
        }
    }
    return <InstanceType<T>>obj;
}

export const toBitBuffer = <T extends (new (...args: any[]) => {})>(object: { [x: string]: any }, { type, bs, bitmap }: { type?: T, bitmap?: ValueMap[], bs?: BitStream } = {}): Buffer => {
    const map: ValueMap[] = bitmap ?? type?.prototype?._map ?? object?._map;
    
    if(!map?.length)
        throw 'NO BITMAP FOUND';

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

        switch (m.type) {
            case ValueType.unsigned:
            case ValueType.signed: {
                let value = object?.[m.prop];
                value =  value && typeof value === 'number' ? value : 0;
                bitStream.writeBits(value, m.size);
                break;
            }
            case ValueType.buffer: {
                const bufferSize = Math.ceil(m.size / 8)
                let value = object?.[m.prop];
                value =  value && Buffer.isBuffer(value) ? value : Buffer.alloc(bufferSize);
                if(value.length < bufferSize)
                    value = Buffer.concat([value, Buffer.alloc(bufferSize - value.length)])
                const nBitStream = new BitStream(new Uint8Array(value).buffer);
                (<any>nBitStream).bigEndian = true;
                bitStream.writeBitStream(nBitStream, m.size);
                break;
            }
            default:
                let value = object?.[m.prop] ?? [];
                for (let i = 0; i < value?.length && i < m.size; i++) {
                    const v = value[i];
                    if (m.type?.prototype?._map) {
                        toBitBuffer(v, { type: m.type, bs: bitStream });
                    }
                }
                break;
        }
    }
    return bitStream.buffer;
}