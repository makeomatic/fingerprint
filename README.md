# Node.js file fingerprinting

[![Greenkeeper badge](https://badges.greenkeeper.io/makeomatic/fingerprint.svg)](https://greenkeeper.io/)

Returns hash digest (fingerprint) of a given file or stream in node.js
Any hash algorithm that node.js crypto supports can be given.

## Install

`npm i fprint -S`

## Usage

### fprint(input, algorithm, [next])

Returns `algorithm` hex hash digest for a given `input`.
Supports both promise and callback interfaces - either pass `next<err, digest>` as a 3d argument
or operate on a returned promise.

`input` - either `Buffer`, `ReadableStream` or file path. Supports both relative and absolute paths

#### Examples:

```js
const fprint = require('fprint');
const fs = require('fs');
const filepath = '/path/to/file';
const stream = fs.createReadStream(filepath);
const fileContents = fs.readFileSync(filepath);

fprint(file, 'sha256').then(shasum => {
  // operate on sha256 digest
});

fprint(stream, 'sha256').then(shasum => {
  // operate on sha256 digest
});

fprint(filepath, 'sha256').then(shasum => {
  // operate on sha256 digest
})
```

### fprint.sync(buffer, algorithm)

```js
const fs = require('fs');
const fprint = require('fprint');
const file = fs.readFileSync('/path/to/file.min.js');
const md5 = fprint.sync(file, 'md5');
```

## Testing

1. `shasum -a 256 ./test/fixtures/files/* | awk '{print $1}' > ./test/fixtures/sums/sha256`
2. `md5 -q ./test/fixtures/files/* > ./test/fixtures/sums/md5`
3. `npm test`
