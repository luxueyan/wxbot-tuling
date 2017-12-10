const axios = require('axios')
const debug = require('debug')('weixinbot')
const EventSource = require('eventsource')
const API_HOST = 'http://socket.feixiaohao.com/lcc'
const qs = require('querystring')

const CONNECTION_DATA = '[{ "name": "cointickerhub" }, { "name": "globaltickerhub" }]'
const http = axios.create({
  baseURL: API_HOST,
  timeout: 20000
})

const headers = {
  'Accept': 'text/event-stream',
  'Accept-Encoding': 'gzip, deflate',
  'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,en-US;q=0.7,ja;q=0.6',
  'Cache-Control': 'no-cache',
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36',
  'Connection': 'keep-alive',
  'Cookie': 'UM_distinctid=1603094976f6dd-092b5dd584d9f4-173f6d56-fa000-160309497705e9; Hm_lvt_192e611c7ffa4b2f8a5047e5cf45403f=1512634077,1512634636,1512637670,1512643534; Hm_lpvt_192e611c7ffa4b2f8a5047e5cf45403f=1512659622',
  'Host': 'socket.feixiaohao.com',
  'Origin': 'http://www.feixiaohao.com',
  'Referer': 'http://www.feixiaohao.com/'
}

let lastData = {}
let isReconnected = false

// 首次连接后使用
function start(data = {}) {
  debug('start begin', data)
  http.get('/start', {
    headers: headers,
    params: {
      _: +(new Date()),
      transport: 'serverSentEvents',
      clientProtocol: '1.5',
      connectionToken: data.ConnectionToken,
      connectionData: CONNECTION_DATA,
      tid: Math.floor(Math.random() * 11)
    }
  }).then(res => {
    debug('start success: ', res.data)
  }).catch(err => {
    debug('start error: ', err)
  })
}

// reconnect时候用
function ping() {
  http.get('/ping', {
    headers: headers,
    _: +(new Date())
  }).then(res => {
    debug('ping success: ', res.data)
  }).catch(err => {
    debug('ping error: ', err)
  })
}

// 初始化eventsource
function initEs(es, data) {
  es.addEventListener('open', msg => {
    debug('open success: ', msg)
    start(data)
  })

  es.addEventListener('message', msg => {
    if (msg.data === 'initialized') {
      debug('initialized success: ', msg.data)
      debug('isReconnected: ', es.isReconnected)
      if (es.isReconnected) {
        ping()
      }
    } else {
      lastData = msg.data
      debug('last data messageId is: ', lastData.C)
    }
  })

  es.reconnect = async function(onMessage) {
    const querystringR = qs.stringify({
      messageId: lastData.C || '',
      transport: 'serverSentEvents',
      clientProtocol: '1.5',
      connectionToken: data.ConnectionToken,
      connectionData: CONNECTION_DATA,
      tid: Math.floor(Math.random() * 11)
    })
    debug('querystringR: ', querystringR)
    es = new EventSource(API_HOST + '/reconnect?' + querystringR, { headers: headers })
    es.isReconnected = true
    es.addEventListener('message', onMessage)
    return es
  }
}

module.exports = async function() {
  const data = await http.get('/negotiate', {
    headers: headers,
    params: {
      clientProtocol: '1.5',
      connectionData: CONNECTION_DATA,
      _: +(new Date())
    }
  }).then(res => res.data).catch(err => {
    debug(err)
  })
  debug('success get tokens', data)

  const queryString = qs.stringify({
    // withCredentials: false,
    transport: 'serverSentEvents',
    clientProtocol: '1.5',
    connectionToken: data.ConnectionToken,
    connectionData: CONNECTION_DATA,
    tid: 5
  })
  // debug(queryString)

  let es = new EventSource(API_HOST + '/connect?' + queryString, {
    headers: headers
  })

  initEs(es, data)
  return es
}
