const axios = require('axios')
const tulingApi = 'http://www.tuling123.com/openapi/api'
const TULING_KEY = 'f37d203b8b7047058be544950661d6ba' // 你的图灵key
const logger = require('./logger.js')

module.exports = function(msg) {
  return axios.post(tulingApi, Object.assign({
    key: TULING_KEY,
  }, msg)).catch(err => {
    logger.error(err)
  })
}
