# babel-plugin-immutable-record [![Build Status](https://travis-ci.org/stephanos/babel-plugin-immutable-record.svg)](https://travis-ci.org/stephanos/babel-plugin-immutable-record) [![Coverage Status](https://coveralls.io/repos/stephanos/babel-plugin-immutable-record/badge.svg?branch=master&service=github)](https://coveralls.io/github/stephanos/babel-plugin-immutable-record?branch=master)


This plugin is acts as a *preprocessor*: it takes a mutable class
and generates a record with the following properties:

  - immutable
  - type-safe
  - `update()` to do partial updates
  - `toMap()` to export an untyped Map

It's based Facebook's
  [immutable-js](https://facebook.github.io/immutable-js/)
  and
  [Flow](http://flowtype.org/).


## Usage

If you run the plugin on the following input

```js
/* @flow */

import Record from './record';

@Record()
class MyBand {
  name: string;
  members: string[];
  active: boolean = true;
}
```

it will create a file similar to this (details have been omitted):

```js
/* @flow */

import Record from '../decorator';
import { List, Map } from 'immutable';

@Record()
class MyBand extends Record.Base {
  constructor(init: MyBandInit) { /* ... */ }

  get name(): string { /* ... */ }
  get members(): List<string> { /* ... */ }
  get active(): boolean { /* ... */ }

  update(update: MyBandUpdate): MyBand { /* ... */ }
  toMap(): Map<string, any> { /* ... */ }
}

type MyBandInit = { name: string; members: List<string>; active?: boolean };
type MyBandUpdate = { name?: string; members?: List<string>; active?: boolean };
```

The Flow type checker will prevent:

   - missing fields on initalisation
   - wrong type for a field
   - data for undefined properties

This shows how you could use it:

```js
const band = new MyBand({
  name: 'The Be Sharps',
  members: List(['Homer', 'Apu', 'Seymour', 'Clancy'])
});
console.log(band.name); // prints 'The Be Sharps'

const newBand = band.update({ members: band.members.set(3, 'Barney') });
console.log(newBand.members.get(3)); // prints 'Barney'
```

## Get Started

**(1)** Install the plugin:

```
npm install babel-plugin-immutable-record --save-dev
```

**(2)** Add the additional step to your build process, for example in Gulp 4:

```js
gulp.task('precompile', function () {
  return gulp.src('src/**/*.js')
    .pipe(babel({
      "plugins": [
        "babel-plugin-syntax-flow",
        'babel-plugin-syntax-decorators',
        'babel-plugin-syntax-class-properties',
        "babel-plugin-immutable-record"
      ]
    }))
    .pipe(gulp.dest('src'));
});
```

And let it run as early as possible. Also have a watch on any file change.

**NOTE:** This is important. The output of the plugin
should be part of the source code, not the transpiled build.
Otherwise, the type checking wouldn't make much sense.

**(3)** Finally, you need to define the decorator in your source code:

```js
/* @flow */

function Record(): Function {
  return () => {};
}

class Base {}
Record.Base = Base;

export default Record;
```


## Advanced

You can pick a custom name for the decorator (default is `Record`):

```js
{
  "plugins": [
    ...
    ["babel-plugin-immutable-record", {
      "decorator": "ImmutableContainer"
    }]
  ]
}
```

Obviously, you'll then need to adapt the decorator's source file accordingly.
