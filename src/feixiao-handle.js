const { createTextMsg } = require('./message-processer.js')
const fs = require('fs')
// const feixiao = require('./feixiao-es.js')()
const tulingBot = require('./tuling')
const debug = require('debug')('weixinbot')
const cacheData = {}
const { getChartData } = require('./feixiao-chart.js')
const { checkDirective } = require('./bitcoin-map.js')

/*feixiao.then(es => {
  console.log('EventSource init success: ', es)

  function onMessage(msg) {
    if (msg.data !== 'initialized') {
      console.log('payload data success: ', msg)
      // cacheData
    }
  }

  es.addEventListener('message', onMessage)

  es.addEventListener('error', msg => {
    console.log('err: ', msg)
    es.reconnect(onMessage)
  })

  es.addEventListener('close', msg => {
    console.log('close: ', msg)
    // es.reconnect(onMessage)
  })
})*/

const bufferBlock = {} // 缓存上传图片逻辑

module.exports = function(bot) {
  bot.on('friend', async msg => {
    // const path = getTimeUnit(msg.Content)
    const chartType = checkDirective(msg.Content)
    if (chartType) {
      const now = new Date()
      debug('bufferBlock', bufferBlock)
      if (!bufferBlock[msg.Content] || now - bufferBlock[msg.Content] > 600000 || !fs.existsSync(`${__dirname}/tmp/${msg.Content}.png`)) {
        debug('生成图表中...')
        await getChartData(msg.Content, chartType).catch(err => { debug('get chart image err', err) })
        bufferBlock[msg.Content] = now
      }
      bot.uploadImg(`${__dirname}/tmp/${msg.Content}.png`, msg.FromUserName)
    } else {
      const res = await tulingBot({
        info: msg.Content,
        loc: `${msg.Member.Province}${msg.Member.City}`,
        userid: msg.Member.UserName
      })

      createTextMsg(res)
      // console.dir(res, { depth: null })
      bot.sendText(msg.FromUserName, `${res.data.content}`)
      debug(`图灵自动回复：${res.data.content}`)
    }
  })

  bot.on('group', async msg => {
    async function directiveRes(content) {
      const chartType = checkDirective(content)
      if (chartType) {
        const now = new Date()
        if (!bufferBlock[content] || now - bufferBlock[content] > 600000 || !fs.existsSync(`${__dirname}/tmp/${content}.png`)) {
          await getChartData(content, chartType).catch(err => { debug('get chart image err', err) })
          bufferBlock[content] = now
        }
        bot.uploadImg(`${__dirname}/tmp/${content}.png`, msg.FromUserName)
      } else {
        throw 'invalid directive'
        debug('invalid directive')
      }
    }

    // debug(msg, bot)
    if (msg.Content.startsWith(`@${bot.my.NickName}`) || msg.Content.startsWith('@小秘书')) {
      const content = msg.Content.replace(`@${bot.my.NickName}`, '').replace('@小秘书', '').trim()
      debug('prune content is: ', content)
      await directiveRes(content).catch(async() => {
        const res = await tulingBot({
          info: content,
          loc: `${msg.GroupMember.Province}${msg.GroupMember.City}`,
          userid: msg.GroupMember.UserName
        })

        createTextMsg(res)
        // console.dir(res, { depth: null })
        bot.sendText(msg.FromUserName, `@${msg.GroupMember.NickName} ${res.data.content}`)
        debug(`图灵自动回复：${res.data.content}`)
      })
      // // console.dir(res, { depth: null })
      // createTextMsg(res)
      // bot.sendText(msg.FromUserName, `@${msg.GroupMember.NickName} ${res.data.content}`)
      // debug(`图灵自动回复：${res.data.content}`)
    } else if (msg.Content.includes(bot.my.NickName)) {
      bot.sendText(msg.FromUserName, `@${msg.GroupMember.NickName} 你在说我吗？`)
    } else if (msg.Content.startsWith('@all')) {
      bot.sendText(msg.FromUserName, '你其实可以单独@我！')
    } else {
      directiveRes(msg.Content.trim()).catch(() => {
        debug('忽略此条消息', msg.Content)
      })
    }
  })

  bot.run()
}
