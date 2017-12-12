const API_HOST = 'http://api.feixiaohao.com/morecoin/'
const axios = require('axios')
const debug = require('debug')('weixinbot')
const cheerio = require('cheerio')
const fs = require('fs')

const http = axios.create({
  baseURL: API_HOST,
  timeout: 20000
})

const headers = {
  'Accept': 'application/json, text/javascript, */*; q=0.01',
  'Accept-Encoding': 'gzip, deflate',
  'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,en-US;q=0.7,ja;q=0.6',
  'Cache-Control': 'no-cache',
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36',
  'Connection': 'keep-alive',
  // 'Cookie': 'UM_distinctid=1603094976f6dd-092b5dd584d9f4-173f6d56-fa000-160309497705e9; Hm_lvt_192e611c7ffa4b2f8a5047e5cf45403f=1512634077,1512634636,1512637670,1512643534; Hm_lpvt_192e611c7ffa4b2f8a5047e5cf45403f=1512659622',
  'Host': 'api.feixiaohao.com',
  'Origin': 'http://www.feixiaohao.com',
  'Referer': 'http://www.feixiaohao.com/'
}

async function getCodeMap(page) {
  const map = {}
  for (let i = 0; i < 16; i++) {
    const res = await http.get('', {
      params: {
        coinType: 0,
        sortType: 0,
        page: i + 1
      }
    })
    const $ = cheerio.load(`<table>${res.data.result1}</table>`)
    debug(`page ${page}'s tr length is`, $('tr').length)
    $('tr').each((i, tr) => {
      const a = $(tr).find('td').eq(1).find('a')
      const key = a.text().toLowerCase()
      map[key] = a.attr('href').slice(12).slice(0, -1)
    })
  }
  return map
}
getCodeMap().then(map => {
  debug('map: ', map)
  fs.writeFileSync(`${__dirname}/coincode-map.js`, `module.exports = ${JSON.stringify(map)}`, 'utf8')
})
