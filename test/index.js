const Promise = require('bluebird');
const { expect } = require('chai');
const fs = require('fs');
const glob = require('glob');
const path = require('path');

describe('Fingerpint suite', function suite() {
  const filePaths = glob.sync('./fixtures/files/*', { cwd: __dirname, realpath: true });
  const checksums = glob.sync('./fixtures/sums/*', { cwd: __dirname, realpath: true });
  const fingerprint = require('../src');
  const sums = {};

  // extract checksums
  checksums.forEach(filename => {
    const algo = filename.split('/').pop();
    sums[algo] = fs.readFileSync(filename, 'utf-8').split('\n').slice(0, 3);
  });

  describe('buffer input', function bufferSuite() {
    const files = filePaths.map(filepath => {
      return fs.readFileSync(filepath);
    });

    it('returns correct md5 sums', function test() {
      return Promise.map(files, buffer => {
        return fingerprint(buffer, 'md5');
      })
      .reflect()
      .then(result => {
        return result.value();
      })
      .each((checksum, index) => {
        expect(checksum).to.be.eq(sums.md5[index]);
      });
    });

    it('returns correct sha256 sums', function test() {
      return Promise.map(files, buffer => {
        return fingerprint(buffer, 'sha256');
      })
      .reflect()
      .then(result => {
        return result.value();
      })
      .each((checksum, index) => {
        expect(checksum).to.be.eq(sums.sha256[index]);
      });
    });
  });

  describe('stream input', function streamSuite() {
    beforeEach(function initStreams() {
      this.streams = filePaths.map(filepath => {
        return fs.createReadStream(filepath);
      });
    });

    it('returns correct md5 sums', function test() {
      return Promise.map(this.streams, stream => {
        return fingerprint(stream, 'md5');
      })
      .reflect()
      .then(result => {
        return result.value();
      })
      .each((checksum, index) => {
        expect(checksum).to.be.eq(sums.md5[index]);
      });
    });

    it('returns correct sha256 sums', function test() {
      return Promise.map(this.streams, stream => {
        return fingerprint(stream, 'sha256');
      })
      .reflect()
      .then(result => {
        return result.value();
      })
      .each((checksum, index) => {
        expect(checksum).to.be.eq(sums.sha256[index]);
      });
    });
  });

  describe('path input', function pathSuite() {
    it('returns correct md5 sums: absolute', function test() {
      return Promise.map(filePaths, filepath => {
        return fingerprint(filepath, 'md5');
      })
      .reflect()
      .then(result => {
        return result.value();
      })
      .each((checksum, index) => {
        expect(checksum).to.be.eq(sums.md5[index]);
      });
    });

    it('returns correct sha256 sums: absolute', function test() {
      return Promise.map(filePaths, filepath => {
        return fingerprint(filepath, 'sha256');
      })
      .reflect()
      .then(result => {
        return result.value();
      })
      .each((checksum, index) => {
        expect(checksum).to.be.eq(sums.sha256[index]);
      });
    });

    it('returns correct md5 sums: relative', function test() {
      return Promise.map(filePaths, filepath => {
        return fingerprint(path.relative(__dirname, filepath), 'md5');
      })
      .reflect()
      .then(result => {
        return result.value();
      })
      .each((checksum, index) => {
        expect(checksum).to.be.eq(sums.md5[index]);
      });
    });

    it('returns correct sha256 sums: relative', function test() {
      return Promise.map(filePaths, filepath => {
        return fingerprint(path.relative(__dirname, filepath), 'sha256');
      })
      .reflect()
      .then(result => {
        return result.value();
      })
      .each((checksum, index) => {
        expect(checksum).to.be.eq(sums.sha256[index]);
      });
    });
  });
});
