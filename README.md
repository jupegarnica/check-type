# Garn-validator

Ultra fast runtime type validator for vanilla JS without dependencies.

[![npm version](https://badge.fury.io/js/garn-validator.svg)](https://www.npmjs.com/package/garn-validator)

# Features

- Ultra light and **fast**: 3kB unzip (1.5 gzipped) with **0 dependencies**
- Support for checking primitives values and objects with schemas
- Easy to use and simple to learn but powerful
- Custom behaviors (4 built-in: isValid, isValidOrThrow  isValidOrLog and hasErrors)
- Works with ESModules or CommonJS from node 8.x to latests

# Get started

## Install

```bash
npm install garn-validator
# or yarn add garn-validator
```

#### Import with ES Modules

```js
import isValidOrThrow from "garn-validator"; // default export is isValidOrThrow
// or use named exports
import { isValidOrThrow } from "garn-validator";
```

#### Require with CommonJs

```js
const { isValidOrThrow } = require("garn-validator/commonjs");
// or use de default export
const isValidOrThrow = require("garn-validator/commonjs").default;
```

### Basic Use

```js
import is from "garn-validator"; // default export is isValidOrThrow

//check primitives against built-in constructors
is(Number) (2); // doesn't throws, all ok
is(String) (2); // will throw

// check against regex
is(/a*/) ("a"); // doesn't throws, all ok
is(/a/) ("b"); // will throw

// check against primitive
is("a") ("a"); // doesn't throws, all ok
is(true) (false); // will throw

// check against custom function
is((value) => value > 0) (33); // doesn't throws, all ok
is((value) => value > 0) (-1); // wil throw
is(Number.isNaN) (NaN); // doesn't throws, all ok

// check against enums (OR operator)
is(["a", "b"]) ("a"); // doesn't throws, all ok
is(["a", "b"]) ("c"); // will throw
is([Number, String]) ("18"); // doesn't throws
is([null, undefined, false, (value) => value < 0]) (18); // will throw

// check multiple validations (AND operator)
is(Array, (val) => val.length > 1) ([1, 2]); // doesn't throws
is(Array, (val) => val.includes(0)) ([1, 2]); // will throw

// check objects
const schema = { a: Number, b: Number }; // a and b are required
const obj = { a: 1, b: 2 };
is(schema) (obj); // doesn't throws, all ok

is({ a: 1 }) (obj); // doesn't throws, all keys on the schema are valid
is({ c: 1 }) (obj); // will throw (c is missing)

// check all keys that matches regex
is({ [/[a-z]/]: Number }) ({
  x: 1,
  y: 2,
  z: 3,
  CONSTANT: "foo",
}); // doesn't throws, all lowercase keys are numbers

// optional keys
is({ x$: Number }) ({ x: 1 }); // doesn't throws, x is present and is Number
is({ x$: String }) ({ x: 1 }); // will throw, x is present but is not String
is({ x$: String }) ({}); // doesn't throws, x is undefined

// you can use key$ or 'key?',
// it would be nicer to have key? without quotes but is not valid JS

is({ "x?": String }) ({}); // doesn't throws
```

### Composable

```js
// Simple example
const isPositive = is( v => v > 0 );
const isNotBig = is( v => v < 100 );

isPositive(-2); // will throw

is(isPositive,isNotBig) (200); // will throw


// Real example
const isValidPassword = is(
  String,
  (str) => str.length >= 8,
  /[a-z]/,
  /[A-Z]/,
  /[0-9]/,
  /[-_/!·$%&/()]/
);

const isValidName = is(String, (name) => name.length >= 3);
const isValidAge = is(
  Number,
  (age) => age > 18,
  (age) => age < 40
);

const isValidUser = is({
  name: isValidName,
  age: isValidAge,
  password: isValidPassword,
  country:['ES','UK']
});

isValidUser({
  name: "garn",
  age: 38,
  password: "12345aA-",
  country: 'ES'
}); // ok

isValidUser({
  name: "garn",
  age: 38,
  password: "1234", // incorrect
  country: 'ES'
}); // will throw
```


### Behaviors

There are 5 behaviors you can import:

- `isValidOrThrow` (returns true of throw on first error)
- `hasErrors` (return null or array of errors, never throws)
- `isValid` (returns true or false, never throws)
- `isValidOrLog` (returns true or false and log first error, never throws)
- `isValidOrLogAllErrors`  (returns true or false and log all errors, never throws)
- `isValidOrThrowAllErrors` (returns true or throw [AggregateError](https://developer.mozilla.org/es/docs/Web/JavaScript/Referencia/Objetos_globales/AggregateError) with all errors found)
``
The default export is `isValidOrThrow`

Learn more at [errors.test.js](https://github.com/jupegarnica/garn-validator/blob/master/tests/errors.test.js)

```js
import { isValid } from "garn-validator";

// stops in first Error
isValid(/[a-z]/) ("g"); // returns true
isValid(/[a-z]/) ("G"); // returns false, doesn't throws
```

```js
import { isValidOrLog } from "garn-validator";

// stops in first Error
isValidOrLog(/[a-z]/) ("g"); // do nothing (but also returns true)
isValidOrLog(/[a-z]/) ("G"); // logs error and return false

```

```js
import { hasErrors } from "garn-validator";

// return null or array or errors
// checks until the end
hasErrors(/[a-z]/) ("g"); // null
hasErrors(/[a-z]/, Number) ("G"); // [TypeError, TypeError]

```
## Especial cases

### AsyncFunction && GeneratorFunction

`AsyncFunction` and `GeneratorFunction` constructors are not in the global scope of any of the 3 JS environments (node, browser or node). If you need to check an async function or a generator you con import them from garn-validator.

>  Note:  Async functions and generators are not normal function, so it will fail against Function constructor

```js

import is , {AsyncFunction,GeneratorFunction } from 'garn-validator';

is (AsyncFunction) (async ()=>{}) ; // true
is (GeneratorFunction) (function*(){}) ; // true

is (Function) (function*(){}) ; // throws
is (Function) (async function(){}) ; // throws

```



## Roadmap

- [x] Check value by constructor
- [x] Enum type (oneOf & oneOfType)
- [x] Shape type
- [x] Custom type validation with a function (value, rootValue)
- [x] Check RegEx
- [x] Match object key by RegEx
- [x] Setting to change behavior (throw error , log error or custom logic)
- [x] ArrayOf & objectOf examples
- [x] Multiples validations `isValid(String, val => val.length > 3, /^[a-z]+$/ )('foo')`
- [x] Schema with optionals key `{ 'optionalKey?': Number }` or `{ optionalKey$: Number }`
- [x] Setting for check all keys (no matter if it fails) and return (or throw) an array of errors
- [ ] Async validation support
- [ ] Support for deno
- [ ] Support for browser



### More examples

Watch folder [tests](https://github.com/jupegarnica/garn-validator/tree/master/tests) to learn more.

---
#### schema.test.js
```js

```
#### custom-validator.test.js
```js

```

#### errors.test.js
```js

```
