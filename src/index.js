const Weixinbot = require('./weixinbot')
const bot = new Weixinbot({ receiver: '281545294@qq.com' })
const { exec } = require('child_process')
const logger = require('./logger')
const download = require('./download')
const imgcat = require('imgcat')
const debug = require('debug')('weixinbot')
const chongdingHandle = require('./chongding-handle.js')
// const feixiaohaoHandle = require('./feixiaohao-handle.js')

bot.on('qrcode', (qrcodeUrl) => {
  debug(qrcodeUrl)
  imgcat(qrcodeUrl).then(image => {
    debug('微信扫描二维码登录吧')
    logger(image)
  }).catch(err => {
    const qrcodeLocal = '/tmp/qrcode.png'
    logger.warn(`微信二维码获取失败: ${err}, 保存本地后重试`)
    download(qrcodeUrl, qrcodeLocal, function() {
      logger('二维码保存成功')
      exec(`open ${qrcodeLocal}`, (error, stdout, stderr) => {
        if (error !== null) {
          logger.error(`exec error: ${error}`)
        }
      })
    })
  })
})

chongdingHandle(bot)
