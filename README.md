# bitmapper
> Parse/unparse complex objects to/from a buffer array based on a bit structure;

Setup a structure map by defining the bit size of each property. And then convert it back and forth.
The most compact data protocol possible. Perfect for low capacity hardware such as smartcards/rfids or low other band situations.

Currently only supports buffers, numbers and fixed size arrays.
Don't expect the unparsed buffer to be the same since undefined and null will be zeros.
## Installation

NPM Installation:

```sh
npm install bitmapper --save
```

## Usage example

### With typescript decorators 
```typescript
class TestItem {
  @value({ size: 10 })
  key: number;
  @value({ size: 5 })
  value: number;
}

class Test {
  //when the type is an array of other type the size is the fixed array length 
  @value({ size: 14, type: TestItem })
  array: TestMixItem[];
  //defaul type is unsigned number
  @value({ size: 10 })
  value: number;
  @value({ size: 46, type: ValueType.buffer })
  buffer: Buffer;
}

const TestMappable = bitMappable(Test); //to create a extension of the class with parse/unparse method;

const obj1 = new TestMappable();
const buffer = obj1.toBitBuffer(); //this will return a fixed size buffer based on the object map.
const obj2 = TestMappable.fromBitBuffer(buffer); //by acessing this static method you can get an instance of the TestMappable object similar to the obj1

```
Don't need to use the bitMappable class decorator.
```typescript
const obj1 = new Test();
const buffer = toBitBuffer(obj1);
const obj2 = fromBitBuffer(buffer, { type: Test }); 
```

### Without any typescript decorators 

Also don't need to use any class decorator.
```typescript
    const obj1 = { value1: 0xF, value2: 0xAA }
    const bitmap = [ { prop: "value1", size: 4, type: ValueType.unsigned }, { prop: "value2", size: 8, type: ValueType.unsigned } ];
    const buffer = toBitBuffer(x, { bitmap });
    const obj2 = fromBitBuffer(buffer, { bitmap });
```
_For more examples and usage, please refer to the [Test](https://github.com/msi-dev/bitmapper/blob/master/test/test.spec.ts)._

## Release History
* 0.0.3
    * finished readme
    * Add non typescript option without use of decorators
* 0.0.2
    * Fix ignores
    * Add typescript declaration
* 0.0.1
    * Work in progress

## Meta

* Developed by Martonis Sistemas Inteligentes – [@Linkedin](https://br.linkedin.com/company/martonis) – dev@martonis.com.br
* Main contributor - [@moraisp](https://github.com/moraisp)

Distributed under the MIT license.

[https://github.com/msi-dev/bitmapper](https://github.com/msi-dev/bitmapper)

## Contributing

1. Fork it (https://github.com/msi-dev/bitmapper/fork)
2. Create your feature branch (`git checkout -b feature/fooBar`)
3. Commit your changes (`git commit -am 'Add some fooBar'`)
4. Push to the branch (`git push origin feature/fooBar`)
5. Create a new Pull Request
