const tulingBot = require('./tuling')
const { createTextMsg } = require('./message-processer.js')
const debug = require('debug')('weixinbot')

module.exports = function(bot) {
  bot.on('friend', async(msg) => {
    const res = await tulingBot({
      info: msg.Content,
      loc: `${msg.Member.Province}${msg.Member.City}`,
      userid: msg.Member.UserName
    })

    createTextMsg(res)
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

      // console.dir(res, { depth: null })
      createTextMsg(res)
      bot.sendText(msg.FromUserName, `@${msg.GroupMember.NickName} ${res.data.content}`)
      debug(`图灵自动回复：${res.data.content}`)
    } else if (msg.Content.includes(bot.my.NickName)) {
      bot.sendText(msg.FromUserName, '你其实可以单独@我！')
    } else if (msg.Content.startsWith('@all')) {
      bot.sendText(msg.FromUserName, '你其实可以单独@我！')
    }
  })

  bot.run()
}
