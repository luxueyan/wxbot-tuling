const path = require('path')
const http = require('http')
const https = require('https')
const fs = require('fs')
const touch = require('touch')
const tough = require('tough-cookie')
const WeixinbotParent = require('weixinbot')
const debug = require('debug')('weixinbot')
const { CODES, getUrls } = require('weixinbot/lib/conf.js')
const axios = require('axios')
const FileCookieStore = require('tough-cookie-filestore')
const axiosCookieJarSupport = require('node-axios-cookiejar')
const FormData = require('form-data')
const _ = require('lodash')
const { getFileMimeType, getFileSize } = require('./file-tools.js')

const URLS = getUrls({})

// try persistent cookie
const cookiePath = path.join(process.cwd(), '.cookie.json')
touch.sync(cookiePath)
const jar = new tough.CookieJar(new FileCookieStore(cookiePath))
debug('cookiejar:%O', jar)
const req = axios.create({
  timeout: 35e3,
  headers: {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) ' +
      'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2652.0 Safari/537.36',
    'Referer': 'https://wx2.qq.com/?&lang=zh_CN',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate',
    // 'Referer': 'https://wx2.qq.com/',
    'Origin': 'https://wx2.qq.com',
    'Connection': 'keep-alive',
    'Pragma': 'no-cache',
    'Cache-Control': 'no-cache'
  },
  jar,
  withCredentials: true,
  xsrfCookieName: null,
  xsrfHeaderName: null,
  httpAgent: new http.Agent({ keepAlive: true }),
  httpsAgent: new https.Agent({ keepAlive: true }),
})

axiosCookieJarSupport(req)
const uploadCache = {}

class Weixinbot extends WeixinbotParent {
  async uploadImg(filepath, to) {
    debug('filepath', filepath)
    let data = {}
    if (!uploadCache[filepath] || new Date() - uploadCache[filepath].now > 600000) {
      const formData = new FormData()
      const fileSize = getFileSize(filepath)
      const fileName = _.uniqueId('image_')
      formData.append('id', _.uniqueId('WU_FILE_'))
      formData.append('name', fileName)
      formData.append('type', getFileMimeType(filepath).mime)
      formData.append('lastModifiedDate', 'Mon Sep 19 2016 19:11:30 GMT+0800 (CST)')
      formData.append('size', fileSize)
      formData.append('mediatype', 'pic')
      formData.append('uploadmediarequest', JSON.stringify({
        'BaseRequest': this.baseRequest,
        'ClientMediaId': +new Date(),
        'TotalLen': fileSize,
        'StartPos': 0,
        'DataLen': fileSize,
        'MediaType': 4
      }))
      formData.append('webwx_data_ticket', jar.getCookieStringSync('webwx_data_ticket'))
      formData.append('pass_ticket', this.passTicket)
      formData.append('filename', fs.createReadStream(filepath), fileName)

      data = await req.post('https://file.wx2.qq.com/cgi-bin/mmwebwx-bin/webwxuploadmedia?f=json', formData, {
        headers: {
          'Host': 'file.wx2.qq.com',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:42.0) Gecko/20100101 Firefox/42.0',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Referer': 'https://wx2.qq.com/',
          'Origin': 'https://wx2.qq.com',
          'Connection': 'keep-alive',
          'Pragma': 'no-cache',
          'Cache-Control': 'no-cache',
          'Content-Type': `multipart/form-data; boundary=${formData._boundary}`
        }
      }).then(res => res.data).catch(err => { debug('upload image err', err) })
      data.now = new Date()
      uploadCache[filepath] = data
    } else {
      data = uploadCache[filepath]
      debug('upload image used cached')
    }
    // const data = { MediaId: '@crypt_85bf735f_491623f9b146d300f876a66cc294bf0b48745a1fe07d4cd97daede1f32a67d2ddcefe3bae0e0e988fb69484f61c70ffb8945420fdebbcd16992de20ed448a65cff38c4d3ea24e6cf7b1ca488c9beb78befbe157d84b9041e7a5127182f8ec0e67d137ccfd78377a41e918be48604f31fe8b8da6593a3d8d160c9b980b7ac3d2c367016ee0b13a6fa2c185856f6469920929267a6bf74a9cc4b15a2250aaeb3cdff7874173662e6051d7f1601171a503694d41d9e2a19d4d56ded48718e262ac13ccb6922df17d30e3f72bf1599683a74bb9a8b560547eb7518a8d76897e0fa2cdf971d29f45f19b009c6dc35059ec08092739fb933bef3a83835e942deb45f12aa466b3dc4b3d9410b0bbff475691a9f34c72f5e56c37c955cc2703494389866d4674e0e8e550319858f6ba9018947f04a9bdbb1f81ebec31f658862ce3eea51' }
    this.sendImg(to, data)
    debug('upload image success', data)
  }
  async sendImg(to, uploadedImageData, callback) {

    const clientMsgId = (+new Date + Math.random().toFixed(3)).replace('.', '')
    // const media = await req.post(URLS.API_webwxuploadmedia, )

    req.post('https://wx2.qq.com/cgi-bin/mmwebwx-bin/webwxsendmsgimg?fun=async&f=json', {
      BaseRequest: this.baseRequest,
      Msg: {
        Type: CODES.MSGTYPE_IMAGE,
        Content: '',
        FromUserName: this.my.UserName,
        ToUserName: to,
        MediaId: uploadedImageData.MediaId,
        LocalID: clientMsgId,
        ClientMsgId: clientMsgId,
      },
      Scene: 0
    }, {
      headers: {
        'Accept': 'Accept:application/json, text/plain, */*',
        'content-type': 'application/json; charset=UTF-8'
      },
      params: {
        pass_ticket: this.passTicket,
      },
    }).then(res => {
      const { data } = res
      debug('send img success', data)
      callback = callback || (() => (null))
      if (!data || !data.BaseResponse || data.BaseResponse.Ret !== 0) {
        return callback(new Error('Send img fail'))
      }

      callback()
    }).catch((e) => {
      debug('send img network error', e)
      // network error, retry
      this.sendImg(to, uploadedImageData, callback)
      return
    })
  }
}

module.exports = Weixinbot
