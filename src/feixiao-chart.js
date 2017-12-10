const API_HOST = 'http://api.feixiaohao.com/coinhisdata/'
const axios = require('axios')
const { getTimeUnit, CHART_TYPE } = require('./bitcoin-map.js')
const ChartjsNode = require('chartjs-node')
const FormData = require('form-data')
const path = require('path')
const _ = require('lodash')
const moment = require('moment')
const { getWebshot } = require('./webshot.js')
const debug = require('debug')('weixinbot')

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

exports.getChartData = async function(directive, chartType) {
  if (chartType === CHART_TYPE.DETAIL) {
    const path = getTimeUnit(directive)
    if (!path) {
      debug('invalid path:', path)
      throw 'invalid path'
    }
    debug('path is : ', path)

    const data = await http.get(path, {
      headers: headers
    }).then(res => res.data).catch(err => {
      debug('start error: ', err)
    })

    debug('data get success:%O', data)

    const chartNode = new ChartjsNode(1000, 500)
    const chartOptions = {
      type: 'line',
      data: {
        labels: _.map(data.price_usd, v => moment(v[0]).format('YYYY-MM-DD HH:mm:ss')),
        datasets: [{
          label: directive + ' trend',
          // backgroundColor: 'rgb(255, 99, 132)',
          fill: false,
          borderColor: 'rgb(75, 192, 192)',
          lineTension: 0.1,
          data: _.map(data.price_usd, v => v[1])
        }]
      },
      options: {
        scales: {
          xAxes: [{
            ticks: {
              autoSkip: true,
              maxRotation: 0,
              minRotation: 0
            }
          }],
          yAxes: [{
            scaleLabel: {
              display: true,
              labelString: '$USD'
            }
          }]
        },
        plugins: [{
          beforeDraw: function(chartInstance) {
            var ctx = chartInstance.chart.ctx
            ctx.fillStyle = 'white'
            ctx.fillRect(0, 0, chartInstance.chart.width, chartInstance.chart.height)
          }
        }]
      }
      // options: options
    }

    return chartNode.drawChart(chartOptions).then(() => {
      return chartNode.writeImageToFile('image/png', `${__dirname}/tmp/${directive}.png`)
    })
  } else if (chartType === CHART_TYPE.SUMMARY) {
    return getWebshot(directive)
  }
  // .then(() => {
  //   // chart is created

  //   // get image as png buffer
  //   // const fileBuffer = chartNode.getImageBuffer('image/png');
  // })
  // .then(buffer => {
  //   Array.isArray(buffer) // => true
  //   // as a stream
  //   return chartNode.getImageStream('image/png');

  // })
  // .then(streamResult => {
  //   // using the length property you can do things like
  //   // directly upload the image to s3 by using the
  //   // stream and length properties
  //   streamResult.stream // => Stream object
  //   streamResult.length // => Integer length of stream
  //   // write to a file
  //   return chartNode.writeImageToFile('image/png', `${__dirname}/tmp/${directive}.png`)
  // })
  // .then(() => {
  //   // chart is now written to the file path
  //   // ./testimage.png
  // });
}

// exports.getChartData('bts-d')
