const webshot = require('webshot')
const debug = require('debug')('weixinbot')
const { getSummaryPath } = require('./directive-helper.js')

const options = {
  defaultWhiteBackground: true,
  screenSize: {
    width: 400,
    height: 1000
  },
  shotSize: {
    width: 400,
    height: 380
  },
  shotOffset: {
    left: 0,
    top: 0
  },
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36'
}

const bufferBlock = {}

exports.getWebshot = function(directive) {
  const path = getSummaryPath(directive)
  return new Promise((resolve, reject) => {
    const now = new Date()
    debug('bufferBlock', bufferBlock)
    const filepath = `${__dirname}/tmp/${directive}.png`
    if (!bufferBlock[directive] || now - bufferBlock[directive] > 600000 || !fs.existsSync(filepath)) {
      webshot(`http://m.feixiaohao.com/currencies/${path}/`, filepath, options, function(err) {
        if (err) {
          debug('webshot save err', err)
          reject(err)
        }
        bufferBlock[directive] = filepath
        resolve(filepath)
      })
    } else {
      resove(filepath)
    }
  })
}
