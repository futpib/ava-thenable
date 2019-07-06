# ava-thanable

> `await` [AVA](https://github.com/avajs/ava) tests

[![Build Status](https://travis-ci.org/futpib/ava-thenable.svg?branch=master)](https://travis-ci.org/futpib/ava-thenable) [![Coverage Status](https://coveralls.io/repos/github/futpib/ava-thenable/badge.svg?branch=master)](https://coveralls.io/github/futpib/ava-thenable?branch=master)

## Example

```js
import test from 'ava-thenable';

const login = test('login', t => {
	t.pass();
});

test.join(login, 'post something', t => {
	t.pass();
});
```

## Install

```
yarn add --dev ava-thenable
```

## API

This module only extends the [AVA API](https://github.com/avajs/ava), all the methods not mentioned here should work the same way they work with vanilla AVA.

### test(...args)

Returns a `Promise` that resolves when the test has finished.

### test.join(...testPromises, ...args)

Defines a test that waits the promises of other tests (`testPromises`). Named after [Bluebird.join](http://bluebirdjs.com/docs/api/promise.join.html).
