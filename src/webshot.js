const webshot = require('webshot')
const { getSummaryPath } = require('./bitcoin-map.js')

const options = {
  screenSize: {
    width: 1277,
    height: 1000
  },
  shotSize: {
    width: 1200,
    height: 366
  },
  shotOffset: {
    left: 38.5,
    top: 230
  },
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36'
}

exports.getWebshot = function(directive) {
  const path = getSummaryPath(directive)
  return new Promise((resolve, reject) => {
    webshot(`http://www.feixiaohao.com/currencies/${path}/`, `${__dirname}/tmp/${directive}.png`, options, function(err) {
      if (err) {
        console.log('webshot save err', err)
        reject(err)
      }
      resolve()
    })
  })
}
