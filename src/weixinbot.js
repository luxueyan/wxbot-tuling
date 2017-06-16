const WeixinbotParent = require('weixinbot')
const debug = require('debug')('weixinbot')

class Weixinbot extends WeixinbotParent {
  sendImg(msg) {
    weixinbot(msg)
  }
}

module.exports = Weixinbot
