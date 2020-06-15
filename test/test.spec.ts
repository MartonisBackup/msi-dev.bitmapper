import { value, bitMappable } from "../src/decorators";
import { assert } from 'chai'
import { ValueType } from "../src/types";
import _ from 'lodash';
import { toBitBuffer, fromBitBuffer } from "../src/mapper";
class TestUnsigned {
  @value({ size: 4 })
  value1: number;
  @value({ size: 8 })
  value2: number;
}

const TestUnsignedMappable = bitMappable(TestUnsigned);

class TestSigned {
  @value({ size: 4, type: ValueType.signed })
  value1: number;
  @value({ size: 4, type: ValueType.signed })
  value2: number;
  @value({ size: 4, type: ValueType.unsigned })
  value3: number;
}

const TestSignedMappable = bitMappable(TestSigned);

class TestBuffer {
  @value({ size: 4, type: ValueType.unsigned })
  value0: number;
  @value({ size: 12, type: ValueType.buffer })
  value1: Buffer;
  @value({ size: 12, type: ValueType.buffer })
  value2: Buffer;
  @value({ size: 8, type: ValueType.buffer })
  value3: Buffer;
}

const TestBufferMappable = bitMappable(TestBuffer);

class TestArrayItem {
  @value({ size: 4 })
  value1: number;
  @value({ size: 4 })
  value2: number;
}

class TestArray {
  @value({ size: 4, type: ValueType.buffer })
  value1: Buffer;
  @value({ size: 3, type: TestArrayItem })
  array: TestArrayItem[];
}

const TestArrayMappable = bitMappable(TestArray);

class TestMixItem {
  @value({ size: 10 })
  appId: number;
  @value({ size: 5 })
  backup: number;
}

class TestMix {
  @value({ size: 14, type: TestMixItem })
  index: TestMixItem[];
  @value({ size: 46, type: ValueType.buffer })
  filler: Buffer;
  @value({ size: 10 })
  issuer: number;
  @value({ size: 4 })
  version: number;
  @value({ size: 5 })
  filler2: number;
  @value({ size: 5 })
  cardDesign: number;
  @value({ size: 24 })
  crdSnr: number;
  @value({ size: 4 })
  checkDig: number;
  @value({ size: 13 })
  date: number;
  @value({ size: 11 })
  time: number;
  @value({ size: 4 })
  filler3: number;
  @value({ size: 48, type: ValueType.buffer })
  mac: Buffer;
}

const TestMixMappable = bitMappable(TestMix);

class TestBigMix {
  @value({ size: 4 })
  version: number;
  @value({ size: 4 })
  counter: number;
  @value({ size: 8 })
  time_Grp_Id: number;
  @value({ size: 4 })
  llg_Mask: number;
  @value({ size: 14 })
  line_Lg_Id1: number;
  @value({ size: 14 })
  line_Lg_Id2: number;
  @value({ size: 14 })
  line_Lg_Id3: number;
  @value({ size: 14 })
  line_Lg_Id4: number;
  @value({ size: 13 })
  val_Sta_Date: number;
  @value({ size: 13 })
  val_End_Date: number;
  @value({ size: 2 })
  status: number;
  @value({ size: 3 })
  per_Use_Type: number;
  @value({ size: 9 })
  per_Use_Limit: number;
  @value({ size: 2 })
  date_Status: number;
  @value({ size: 10 })
  filler: number;
  @value({ size: 5 })
  rel_Yr_Id: number;
  @value({ size: 6 })
  rel_Per_Id: number;
  @value({ size: 20 })
  rel_Amnt: number;
  @value({ size: 6 })
  rel_Ctr: number;
  @value({ size: 14 })
  rsn: number;
  @value({ size: 13 })
  purseADate: number;
  @value({ size: 2 })
  purseACurr_Id: number;
  @value({ size: 13 })
  purseBDate: number;
  @value({ size: 2 })
  purseBCurr_Id: number;
  @value({ size: 14 })
  provisionValue: number;
  @value({ size: 33 })
  filler2: Buffer;
  @value({ size: 13 })
  per_Use_Start_Date: number;
  @value({ size: 11 })
  per_Use_Start_Time: number;
  @value({ size: 9 })
  per_Use_Ctr: number;
  @value({ size: 20 })
  purseAValueOnCard: number;
  @value({ size: 20 })
  purseBValueOnCard: number;
  @value({ size: 15 })
  tsn: number;
  //[BIT_SIZE(0 })
  //Filler3: number;
  @value({ size: 40 })
  mAC: Buffer;
}

const TestBigMixMappable = bitMappable(TestBigMix);

describe("Bitmapper", () => {
  it("only unsigned", async () => {
    const x = new TestUnsignedMappable();
    x.value1 = 0xF;
    x.value2 = 0xAA;
    const buffer = x.toBitBuffer();
    console.log(`buffer`, buffer)
    assert.equal(Buffer.compare(buffer, Buffer.from('FAA0', 'hex')), 0);
    const obj = TestUnsignedMappable.fromBitBuffer(buffer);
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

  it("mix 1", async () => {
    const x = new TestMixMappable();
    x.index = [];
    x.index[0] = { appId: 1023, backup: 11 };
    x.index[1] = { appId: 500, backup: 12 };
    x.index[13] = { appId: 1, backup: 0 };
    x.issuer = 52;
    x.version = 1;
    x.cardDesign = 5;
    x.crdSnr = 1;
    const buffer = x.toBitBuffer();
    console.log(`buffer`, buffer)
    assert.equal(Buffer.compare(buffer, Buffer.from('FFD6FA30000000000000000000000000000000000000000000080000000000000D040500000100000000000000000000', 'hex')), 0);
    const obj = TestMixMappable.fromBitBuffer(buffer);
    console.log(`obj`, obj)
    assert.equal(x.version, obj.version);
    assert.equal(x.index[0].appId, obj.index[0].appId);
    assert.equal(x.index[0].backup, obj.index[0].backup);
    assert.equal(x.index[1].appId, obj.index[1].appId);
    assert.equal(x.index[1].backup, obj.index[1].backup);
    assert.equal(x.index[13].appId, obj.index[13].appId);
    assert.equal(x.index[13].backup, obj.index[13].backup);
  });

  it("mix 2", async () => {
    const x = new TestBigMixMappable();
    x.counter = 0;
    x.version = 1;
    x.time_Grp_Id = 35;
    x.llg_Mask = 1;
    x.line_Lg_Id1 = 79;
    x.line_Lg_Id2 = 898;
    x.line_Lg_Id3 = 120;
    x.line_Lg_Id4 = 7728;
    x.val_Sta_Date = 664;
    x.val_End_Date = 696;
    x.per_Use_Type = 1;
    x.per_Use_Limit = 10;
    x.purseAValueOnCard = 4096; // equivalent to zero
    x.purseBValueOnCard = 4096; // equivalent to zero
    const buffer = x.toBitBuffer();
    console.log(`buffer`, buffer)
    assert.equal(Buffer.compare(buffer, Buffer.from('10231013C38201E1E3014C0AE020A0000000000000000000000000000000000000000000008000080000000000000000', 'hex')), 0);
    const obj = TestBigMixMappable.fromBitBuffer(buffer);
    console.log(`obj`, obj)
    assert.deepEqual(_.pickBy(obj), _.pickBy(x));
  });

  it("by func test", async () => {
    const x = { value1: 0xF, value2: 0xAA }
    const buffer = toBitBuffer(x, { type: TestUnsigned });
    console.log(`buffer`, buffer)
    assert.equal(Buffer.compare(buffer, Buffer.from('FAA0', 'hex')), 0);
    const obj = fromBitBuffer(buffer, { type: TestUnsigned });
    console.log(`obj`, obj)
    assert.equal(obj.value1, x.value1);
    assert.equal(obj.value2, x.value2);
  });

  it("by object test", async () => {
    const x = new TestUnsigned()
    x.value1 = 0xF
    x.value2 = 0xAA;
    const buffer = toBitBuffer(x);
    console.log(`buffer`, buffer)
    assert.equal(Buffer.compare(buffer, Buffer.from('FAA0', 'hex')), 0);
    const obj = fromBitBuffer(buffer, { type: TestUnsigned });
    console.log(`obj`, obj)
    assert.equal(obj.value1, x.value1);
    assert.equal(obj.value2, x.value2);
  });


  it("mix 1 empty", async () => {
    const x = new TestMixMappable();

    const buffer = x.toBitBuffer();
    console.log(`buffer`, buffer)                    
    assert.equal(Buffer.compare(buffer, Buffer.from('000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000', 'hex')), 0);
    const obj = TestMixMappable.fromBitBuffer(buffer);
    console.log(`obj`, obj)
    assert.notStrictEqual(x.version, obj.version);
  });

  
  it("mix 1 null", async () => {
    const buffer = toBitBuffer(null, { type: TestUnsigned });
    console.log(`buffer`, buffer)                    
    assert.equal(Buffer.compare(buffer, Buffer.from('0000', 'hex')), 0);
    const obj = fromBitBuffer(buffer, { type: TestUnsigned });
    console.log(`obj`, obj)
    assert.equal(obj.value1, 0);
    assert.equal(obj.value2, 0);
  });

  it("only by map", async () => {
    const x = { value1: 0xF, value2: 0xAA }
    const bitmap = [ { prop: "value1", size: 4, type: ValueType.unsigned }, { prop: "value2", size: 8, type: ValueType.unsigned } ];
    const buffer = toBitBuffer(x, { bitmap });
    console.log(`buffer1`, buffer)
    assert.equal(Buffer.compare(buffer, Buffer.from('FAA0', 'hex')), 0);
    const obj = fromBitBuffer(buffer, { bitmap });
    console.log(`obj`, obj)
    assert.equal(obj.value1, x.value1);
    assert.equal(obj.value2, x.value2);
  });

});


