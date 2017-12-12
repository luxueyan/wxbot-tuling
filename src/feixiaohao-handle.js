const { createTextMsg } = require('./message-processer.js')
const fs = require('fs')
// const feixiao = require('./feixiao-es.js')()
const tulingBot = require('./tuling')
const debug = require('debug')('weixinbot')
const cacheData = {}
const { crawler } = require('./feixiaohao-crawler.js')
const { checkDirective, CHART_TYPE } = require('./directive-helper.js')
const cheerio = require('cheerio')

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

// const bufferBlock = {} // 缓存上传图片逻辑

async function directiveRes(content, msg, bot) {
  const chartType = checkDirective(content)
  if (chartType === CHART_TYPE.SUMMARY || chartType === CHART_TYPE.DETAIL) {
    debug('capture image', content)
    const filepath = await crawler(content, chartType).catch(err => { debug('get chart image err', err) })
    debug('crawler done saved file at: ', filepath)
    bot.uploadImg(filepath, msg.FromUserName)
  } else if (chartType === CHART_TYPE.BASEINFO) {
    const filepath = await crawler(content, chartType).catch(err => { debug('get snap shot err', err) })
    debug('get snap shot success: ', filepath)

    const htmlContent = fs.readFileSync(filepath)
    $ = cheerio.load(htmlContent, {
      decodeEntities: false
    })
    bot.sendText(msg.FromUserName, $('.art-box').text())
    debug('baseinfo is ', $('.art-box').text())
  } else if (chartType === CHART_TYPE.SUMMARY_TEXT) {
    const filepath = await crawler(content, chartType).catch(err => { debug('get snap shot err', err) })
    debug('get snap shot success: ', filepath)

    const htmlContent = fs.readFileSync(filepath)
    $ = cheerio.load(htmlContent, {
      decodeEntities: false
    })
    bot.sendText(msg.FromUserName, $('.price1').text().replace(/\s+/g, '\n'))
    debug('price test is ', $('.price1').text())
  } else {
    throw 'invalid directive'
    debug('invalid directive')
  }
}

module.exports = function(bot) {
  bot.on('friend', async msg => {
    await directiveRes(msg.Content, msg, bot).catch(async(err) => {
      debug('get crawler data err', err)
      const res = await tulingBot({
        info: msg.Content,
        loc: `${msg.Member.Province}${msg.Member.City}`,
        userid: msg.Member.UserName
      })
      createTextMsg(res)
      bot.sendText(msg.FromUserName, res.data.content)
      debug(`图灵自动回复：${res.data.content}`)
    })
  })

  bot.on('group', async msg => {
    if (msg.Content.startsWith(`@${bot.my.NickName}`) || msg.Content.startsWith('@小秘书')) {
      const content = msg.Content.replace(`@${bot.my.NickName}`, '').replace('@小秘书', '').trim()
      debug('prune content is: ', content)

      await directiveRes(content, msg, bot).catch(async() => {
        const res = await tulingBot({
          info: content,
          loc: `${msg.GroupMember.Province}${msg.GroupMember.City}`,
          userid: msg.GroupMember.UserName
        })

        createTextMsg(res)
        bot.sendText(msg.FromUserName, `@${msg.GroupMember.NickName} ${res.data.content}`)
        debug(`图灵自动回复：${res.data.content}`)
      })
    } else if (msg.Content.includes(bot.my.NickName)) {
      bot.sendText(msg.FromUserName, `@${msg.GroupMember.NickName} 你在说我吗？`)
    } else if (msg.Content.startsWith('@all')) {
      bot.sendText(msg.FromUserName, '你其实可以单独@我！')
    } else {
      directiveRes(msg.Content.trim(), msg, bot).catch((err) => {
        debug('err', err)
        debug('忽略此条消息', msg.Content)
      })
    }
  })

  bot.run()
}
