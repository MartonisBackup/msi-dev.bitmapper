import { value, bitMappable} from "../src/decorators";
import { assert }from 'chai'
import { ValueType } from "../src/types";

class TestUnsigned {
  @value({size: 4})
  value1: number;
  @value({size: 8})
  value2: number;
}

let TestUnsignedMappable = bitMappable(TestUnsigned);

class TestSigned {
  @value({size: 4, type: ValueType.signed})
  value1: number;
  @value({size: 4, type: ValueType.signed})
  value2: number;
  @value({size: 4, type: ValueType.unsigned})
  value3: number;
}

let TestSignedMappable = bitMappable(TestSigned);

class TestBuffer {
  @value({size: 4, type: ValueType.unsigned})
  value0: number;
  @value({size: 12, type: ValueType.buffer})
  value1: Buffer;
  @value({size: 12, type: ValueType.buffer})
  value2: Buffer;
  @value({size: 8, type: ValueType.buffer})
  value3: Buffer;
}

let TestBufferMappable = bitMappable(TestBuffer);

class TestItem {
  @value({ size: 4 })
  value1: number;
  @value({ size: 4 })
  value2: number;
}

class TestArray {
  @value({size: 4, type: ValueType.buffer})
  value1: Buffer;
  @value({size: 3, type: TestItem})
  array: TestItem[];
}

let TestArrayMappable = bitMappable(TestArray);

describe("Bitmapper", () => {    
  it("only unsigned", async () => {
    const x = new TestUnsignedMappable();
    x.value1 = 0xF;
    x.value2 = 0xAA;
    const buffer = x.toBitBuffer();
    console.log(`buffer`, buffer)
    assert.equal(Buffer.compare(buffer, Buffer.from('FAA0', 'hex')), 0);
    const obj = TestUnsignedMappable.fromBitBuffer(buffer);
    console.log(`obj`, obj)
    assert.deepEqual(obj, <any>x);
  });

  it("only signed", async () => {
    const x = new TestSignedMappable();
    x.value1 = -1;
    x.value2 = -1;
    x.value3 = 0xA;
    const buffer = x.toBitBuffer();
    console.log(`buffer`, buffer)
    assert.equal(Buffer.compare(buffer, Buffer.from('FFA0', 'hex')), 0);
    const obj = TestSignedMappable.fromBitBuffer(buffer);
    console.log(`obj`, obj)
    assert.deepEqual(obj, <any>x);
  });

  it("only buffer", async () => {
    const x = new TestBufferMappable();
    x.value1 = Buffer.from('FFA0', 'hex');
    x.value2 = Buffer.from('BFF0', 'hex');
    x.value3 = Buffer.from('FF', 'hex');
    const buffer = x.toBitBuffer();
    console.log(`buffer`, buffer)
    assert.equal(Buffer.compare(buffer, Buffer.from('0FFABFFFF0', 'hex')), 0);
    const obj = TestBufferMappable.fromBitBuffer(buffer);
    console.log(`obj`, obj)
    assert.equal(Buffer.compare(x.value1, obj.value1), 0);
    assert.equal(Buffer.compare(x.value2, obj.value2), 0);
    assert.equal(Buffer.compare(x.value3, obj.value3), 0);
  });


  it("only array", async () => {
    const x = new TestArrayMappable();
    x.value1 = Buffer.from('F0', 'hex');
    x.array = [];
    x.array[0] = { value1: 0xA, value2: 0xB };
    x.array[2] = { value1: 0xC, value2: 0xD };
    const buffer = x.toBitBuffer();
    console.log(`buffer`, buffer)
    assert.equal(Buffer.compare(buffer, Buffer.from('FAB00CD0', 'hex')), 0);
    const obj = TestArrayMappable.fromBitBuffer(buffer);
    console.log(`obj`, obj)
    assert.equal(Buffer.compare(x.value1, obj.value1), 0);
    assert.equal(x.array[0].value1, obj.array[0].value1);
    assert.equal(x.array[0].value2, obj.array[0].value2);
    assert.equal(x.array[2].value1, obj.array[2].value1);
    assert.equal(x.array[2].value2, obj.array[2].value2);
  });
});
  

