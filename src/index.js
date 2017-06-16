const Weixinbot = require('./weixinbot')
const bot = new Weixinbot({ receiver: '281545294@qq.com' })
const { exec } = require('child_process')
const logger = require('./logger')
const download = require('./download')
const tulingBot = require('./tuling')
const imgcat = require('imgcat')
const debug = require('debug')('weixinbot')
const _ = require('lodash')

const listCompile = _.template(
  `<% _.forEach(list, function(item) { %>
    <%- item.name %>：<%- item.info %>\r
    <%- item.detailurl %>
  <%}); %>
`)

const createResContent = function(res) {
  res.data.content = res.data.text
  if (res.data.url) {
    if (res.data.url.startsWith('http://m.image.so.com')) {
      res.data.url = res.data.url.replace('http://m.image.so.com/i?q', 'http://pic.sogou.com/pics?query')
    }
    res.data.content = `${res.data.text || '😰，这个问题难住我了'}${res.data.url || ''}`
  } else if (res.data.list) {
    res.data.content = listCompile(res.data)
  }
}

bot.on('qrcode', (qrcodeUrl) => {
  debug(qrcodeUrl)
  imgcat(qrcodeUrl).then(image => {
    debug('微信扫描二维码登录吧')
    logger(image)
  }).catch(err => {
    const qrcodeLocal = '/tmp/qrcode.png'
    logger.warn(`微信二维码获取失败: ${error}, 保存本地后重试`)
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

bot.on('friend', async(msg) => {
  const res = await tulingBot({
    info: msg.Content,
    loc: `${msg.Member.Province}${msg.Member.City}`,
    userid: msg.Member.UserName
  })

  createResContent(res)
  // console.dir(res, { depth: null })
  bot.sendText(msg.FromUserName, `${res.data.content}`)
  debug(`图灵自动回复：${res.data.content}`)
})

bot.on('group', async(msg) => {
  if (msg.Content.startsWith(`@${bot.my.NickName}`)) {
    const res = await tulingBot({
      info: msg.Content,
      loc: `${msg.GroupMember.Province}${msg.GroupMember.City}`,
      userid: msg.GroupMember.UserName
    })

    console.dir(res, { depth: null })
    createResContent(res)
    bot.sendText(msg.FromUserName, `@${msg.GroupMember.NickName} ${res.data.content}`)
    debug(`图灵自动回复：${res.data.content}`)
  } else if (msg.Content.includes(bot.my.NickName)) {
    bot.sendText(msg.FromUserName, `@${msg.GroupMember.NickName} 你在说我吗？`)
  }
})

bot.run()
