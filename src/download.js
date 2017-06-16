const fs = require('fs')
const logger = require('./logger')
const axios = require('axios')

module.exports = function(uri, filename, callback) {
  axios.head(uri).then((err, res, body) => {
    logger('content-type:', res.headers['content-type'])
    logger('content-length:', res.headers['content-length'])
    axios({
      method: 'get',
      url: uri,
      responseType: 'stream'
    }).then(res => {
      res.data.pipe(fs.createWriteStream(filename)).on('close', callback)
    })
  }).catch(error => logger.error(error))
}
