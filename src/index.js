const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const callsite = require('callsite');
const Promise = require('bluebird');
const { isReadable } = require('isstream');

/**
 * Utility function to create stream based on file's location, supports both relative and absolute paths
 * @param  {String} location [description]
 * @return {ReadableStream}
 */
function createStream(location) {
  if (path.isAbsolute(location)) {
    return fs.createReadStream(location);
  }

  // for relative paths
  const stack = callsite();
  const length = stack.length;

  // filter out the file itself
  let iterator = 0;
  while (iterator < length) {
    const call = stack[iterator++];
    const filename = call.getFileName();
    if (__filename !== filename) {
      const source = path.resolve(path.dirname(filename), location);
      return fs.createReadStream(source);
    }
  }
}

/**
 * Accepts Buffer and creates it's digest
 * @param  {Buffer}   buffer
 * @param  {String}   algorithm
 * @return {Promise}
 */
function digestSync(buffer, algorithm) {
  const hash = crypto.createHash(algorithm).update(buffer);
  return hash.digest('hex');
}

/**
 * Accepts stream and creates it's digest
 * @param  {ReadableStream}   stream
 * @param  {String}           algorithm
 * @return {Promise}
 */
function digestStream(stream, algorithm) {
  if (!stream.isPaused()) {
    stream.pause();
  }

  return new Promise(function resolveStream(resolve, reject) {
    const hash = crypto.createHash(algorithm);

    stream.on('data', function handleData(chunk) {
      hash.update(chunk);
    });

    stream.on('error', function handleError(err) {
      return reject(err);
    });

    stream.on('end', function handleEnd() {
      resolve(hash.digest('hex'));
    });

    stream.resume();
  });
}

/**
 * Creates fingerprint for a given input
 * @param  {Buffer|String|ReadableStream}   source
 * @param  {String}                         algorithm - any supported algorithm by node.js crypto module https://nodejs.org/api/crypto.html#crypto_crypto_createhash_algorithm
 * @param  {Function}                       [next] - optional next function for callback style
 * @return {Promise}
 */
module.exports = exports = function createFingerprint(source, algorithm, next) {
  let promise;

  // we have file buffered in memory, create digest on it
  if (Buffer.isBuffer(source)) {
    promise = Promise.resolve(digestSync(source, algorithm));
  } else if (isReadable(source)) {
    promise = digestStream(source, algorithm);
  } else if (typeof source === 'string') {
    promise = digestStream(createStream(source), algorithm);
  } else {
    throw new TypeError('source must be either a buffer, readable stream or a string with absolute or relative path');
  }

  if (typeof next === 'function') {
    return promise.asCallback(next);
  }

  return promise;
};

/**
 * Expose digest sync API
 * @param {Buffer} input
 * @param {String} algorithm
 * @type {String}
 */
exports.sync = digestSync;
