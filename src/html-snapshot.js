const htmlSnapshots = require('html-snapshots')
const debug = require('debug')('weixinbot')
const fs = require('fs')
const { bitcoinMap } = require('./directive-helper.js')

const bufferBlock = {}

exports.getBaseInfo = async function(directive) {
  const coinCode = bitcoinMap[directive.slice(0, -1)] || ''
  if (!coinCode) throw 'base info coincode err'

  const now = new Date()
  debug('bufferBlock', bufferBlock)
  const filepath = `${__dirname}/snapshots/currencies/${coinCode}/#baseinfo/index.html`
  if (!bufferBlock[directive] || now - bufferBlock[directive] > 600000 || !fs.existsSync(filepath)) {
    const pages = {
      [`http://m.feixiaohao.com/currencies/${coinCode}/#baseinfo`]: '#baseinfo',
    }

    return htmlSnapshots.run({
      input: 'array',
      source: Object.keys(pages),
      outputDir: `${__dirname}/snapshots`,
      outputDirClean: false,
      selector: pages
    }).then(function(completed) {
      debug('snap completed:', completed)
      bufferBlock[directive] = completed[0]
      return completed[0]
      // completed is an array of full file paths to the completed snapshots.
    }).catch(function(error) {
      // debug('snapshot err: ', error)
      throw 'snapshot err'
      // error is an Error instance.
      // error.completed is an array of snapshot file paths that were completed.
      // error.notCompleted is an array of file paths that did NOT complete.
    })
  } else {
    return filepath
  }
}
