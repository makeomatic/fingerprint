import {describe, beforeEach, it} from 'mocha'
import {expect} from 'chai'
import * as fs from 'fs'
import * as glob from 'glob'
import * as path from 'path'
import {createFingerprint} from '..'
import {ReadStream, readFileSync} from 'fs'

interface Results {
  md5: string[];
  sha256: string[];
}

type Algos = keyof Results;

describe('Fingerpint suite', () => {
  const filePaths = glob.sync('./fixtures/files/*', {
    cwd: __dirname,
    realpath: true
  })
  const checksums = glob.sync('./fixtures/sums/*', {
    cwd: __dirname,
    realpath: true
  })
  const sums: Results = {
    md5: [],
    sha256: []
  }

  // Extract checksums
  checksums.forEach((filename) => {
    const algo = filename.split('/').pop()
    sums[algo as Algos] = readFileSync(filename, 'utf-8')
      .split('\n')
      .slice(0, 3)
  })

  describe('buffer input', () => {
    const files = filePaths.map((filepath) => readFileSync(filepath))

    it('returns correct md5 sums', async () => {
      const fingerprints = await Promise.all(
        files.map((buffer) => createFingerprint(buffer, 'md5'))
      )
      fingerprints.forEach((checksum, index) => {
        expect(checksum).to.be.eq(sums.md5[index])
      })
    })

    it('returns correct sha256 sums', async () => {
      const fingerprints = await Promise.all(
        files.map((buffer) => createFingerprint(buffer, 'sha256'))
      )
      return fingerprints.forEach((checksum, index) => {
        expect(checksum).to.be.eq(sums.sha256[index])
      })
    })
  })

  describe('stream input', () => {
    let streams: ReadStream[]
    beforeEach(() => {
      streams = filePaths.map((filepath) => fs.createReadStream(filepath))
    })

    it('returns correct md5 sums', async () => {
      const fingerprints = await Promise.all(
        streams.map((stream) => createFingerprint(stream, 'md5'))
      )

      fingerprints.forEach((checksum, index) => {
        expect(checksum).to.be.eq(sums.md5[index])
      })
    })

    it('returns correct sha256 sums', async () => {
      const fingerprints = await Promise.all(
        streams.map((stream) => createFingerprint(stream, 'sha256'))
      )

      fingerprints.forEach((checksum, index) => {
        expect(checksum).to.be.eq(sums.sha256[index])
      })
    })
  })

  describe('path input', () => {
    it('returns correct md5 sums: absolute', async () => {
      const fingerprints = await Promise.all(
        filePaths.map((filepath) => createFingerprint(filepath, 'md5'))
      )

      fingerprints.forEach((checksum, index) => {
        expect(checksum).to.be.eq(sums.md5[index])
      })
    })

    it('returns correct sha256 sums: absolute', async () => {
      const fingerprints = await Promise.all(
        filePaths.map((filepath) => createFingerprint(filepath, 'sha256'))
      )

      fingerprints.forEach((checksum, index) => {
        expect(checksum).to.be.eq(sums.sha256[index])
      })
    })

    it('returns correct md5 sums: relative', async () => {
      const fingerprints = await Promise.all(
        filePaths.map((filepath) =>
          createFingerprint(path.relative(__dirname, filepath), 'md5')
        )
      )

      fingerprints.forEach((checksum, index) => {
        expect(checksum).to.be.eq(sums.md5[index])
      })
    })

    it('returns correct sha256 sums: relative', async () => {
      const fingerprints = await Promise.all(
        filePaths.map((filepath) =>
          createFingerprint(path.relative(__dirname, filepath), 'sha256')
        )
      )

      fingerprints.forEach((checksum, index) => {
        expect(checksum).to.be.eq(sums.sha256[index])
      })
    })
  })
})
