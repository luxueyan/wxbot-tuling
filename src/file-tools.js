const fs = require('fs') //Load the filesystem module
const readChunk = require('read-chunk');
const fileType = require('file-type');

exports.getFileSize = function(filepath) {
  const stats = fs.statSync(filepath)
  const fileSizeInBytes = stats['size']
  return fileSizeInBytes
}

exports.getFileMimeType = function(filepath) {
  const buffer = readChunk.sync(filepath, 0, 4100)

  return fileType(buffer)
}
