'use strict'

/**
 * .264 files exported by some Chinese IP cameras have proprietary extensions
 * added which must be removed before the file can either be played or converted.
 *
 * The extension's headers start with HXVS, HXVF, HXAF and HXFI. Every header
 * has a total size of 16 bytes. Four bytes for the type string at the beginning
 * of the header. The remaining 12 bytes either contain additional information
 * or are probably padding.
 *
 * ## HXVS
 *
 * This header is found at the beginning of a file. The whole 16 bytes can be
 * skipped.
 *
 * ## HXVF
 *
 * Declares video data. The next four bytes after the type string depict an
 * unsigned int which represents the size of the video data. Data starts after
 * the 16 bytes header.
 *
 * ## HXAF
 *
 * Same as HXVF (including size integer) but the data represents audio.
 *
 * ## HXFI
 *
 * Marks end of file. Succeeding data can be ignored.
 *
 * For a more detailed explanation see https://www.spitzner.org/kkmoon.html.
 */

const util = require('util')
const fs = require('fs')

const stat = util.promisify(fs.stat)
const open = util.promisify(fs.open)
const read = util.promisify(fs.read)
const write = util.promisify(fs.write)
const close = util.promisify(fs.close)

const chipcaco = module.exports

/**
 * Reads data from inBuf and writes output to outBuf.
 * outBuf's size should be big enough and probably identical to size of inBuf.
 *
 * Returns a Promise which resolves to an object { inBuf, outBuf, bytesWritten }
 * where bytesWritten is the amount of bytes written to outBuf.
 *
 * @param {Buffer} inBuf Source buffer of original data to be read
 * @param {Buffer} outBuf Destination buffer where converted data is written to
 * @param {number} size Size of source buffer
 * @returns {Promise<{inBuf: Buffer, outBuf: Buffer, bytesWritten: number}>} Promise of object { inBuf, outBuf, bytesWritten }
 */
chipcaco.buffer = (inBuf, outBuf, size) => new Promise((resolve, reject) => {
  let inPos = 0
  let outPos = 0

  while (inPos < size) {
    const headerEndPos = inPos + 4
    const header = inBuf.toString('ascii', inPos, headerEndPos)

    if (header === 'HXVS') {
      inPos += 16
    } else if (header === 'HXVF') {
      const size = inBuf.readUIntLE(headerEndPos, 4)
      inPos += 16
      inBuf.copy(outBuf, outPos, inPos, inPos + size)
      inPos += size
      outPos += size
    } else if (header === 'HXAF') {
      // Currently we just skip audio data
      const size = inBuf.readUIntLE(headerEndPos, 4)
      inPos += 16 + size
    } else if (header === 'HXFI') {
      break
    } else {
      reject(new Error('Ooops, cannot read buffer'))
    }
  }

  resolve({ inBuf, outBuf, bytesWritten: outPos })
})

/**
 * Reads file specified by srcFile and writes output to destFile.
 *
 * @param {string} srcFile Path to source file
 * @param {string} destFile Path to destination file
 * @see buffer
 * @returns {Promise<boolean>} Promise which resolves to "true" on success
 */
chipcaco.file = (srcFile, destFile) =>
  stat(srcFile)
    .then((stats) => open(srcFile, 'r').then((inFd) => ({ stats, inFd })))
    .then(({ stats, inFd }) => {
      const inBuf = Buffer.allocUnsafe(stats.size)
      return read(inFd, inBuf, 0, stats.size, 0).then((args) => ({ stats, inFd, bytesRead: args.bytesRead, inBuf: args.buffer }))
    })
    .then(({ stats, inFd, bytesRead, inBuf }) => {
      const outBuf = Buffer.alloc(stats.size)
      return chipcaco.buffer(inBuf, outBuf, bytesRead).then(({ bytesWritten }) => ({ inFd, outBuf, bytesWritten }))
    })
    .then(({ inFd, outBuf, bytesWritten }) => close(inFd).then(() => ({ outBuf, bytesWritten })))
    .then(({ outBuf, bytesWritten }) => open(destFile, 'w').then((outFd) => ({ outFd, outBuf, bytesWritten })))
    .then(({ outFd, outBuf, bytesWritten }) => write(outFd, outBuf, 0, bytesWritten, 0).then(() => outFd))
    .then((outFd) => close(outFd))
    .then(() => true)
