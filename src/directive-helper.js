const moment = require('moment')

const bitcoinMap = require('./coincode-map.js')

exports.bitcoinMap = bitcoinMap

const CHART_TYPE = { SUMMARY: 1, DETAIL: 2, BASEINFO: 3, SUMMARY_TEXT: 4 }
exports.CHART_TYPE = CHART_TYPE

exports.checkDirective = function(directive) {
  if (directive.indexOf('-') > -1) {
    const directives = directive.split(/-/)
    if (bitcoinMap[directives[0].trim().toLowerCase()]) {
      return CHART_TYPE.DETAIL
    }
    return null
  } else if (bitcoinMap[directive.trim().toLowerCase()]) {
    return CHART_TYPE.SUMMARY
  } else {
    const d = directive.trim().toLowerCase()
    if (d.slice(-1) === '?' && bitcoinMap[d.slice(0, -1)]) {
      return CHART_TYPE.BASEINFO
    } else if (d.slice(-1) === '!' && bitcoinMap[d.slice(0, -1)]) {
      return CHART_TYPE.SUMMARY_TEXT
    }
    return null
  }
  return null
}

exports.getSummaryPath = function(directive) {
  return bitcoinMap[directive.trim().toLowerCase()] || ''
}

exports.getTimeUnit = function(directive) {
  const directives = directive.split(/-/)
  let timePath = bitcoinMap[directives[0].trim().toLowerCase()] || ''
  if (!timePath || directives.length !== 2) return
  timePath = '/' + timePath
  switch (directives[1].trim()) {
    case 'h':
      timePath += `/${+moment().subtract(1,'h').toDate()}/${+moment().toDate()}`
      break
    case '2h':
      timePath += `/${+moment().subtract(2,'h').toDate()}/${+moment().toDate()}`
      break
    case '3h':
      timePath += `/${+moment().subtract(3,'h').toDate()}/${+moment().toDate()}`
      break
    case '5h':
      timePath += `/${+moment().subtract(5,'h').toDate()}/${+moment().toDate()}`
      break
    case '10h':
      timePath += `/${+moment().subtract(10,'h').toDate()}/${+moment().toDate()}`
      break
    case '12h':
      timePath += `/${+moment().subtract(12,'h').toDate()}/${+moment().toDate()}`
      break
    case 'w':
      timePath += `/${+moment().subtract(7,'d').toDate()}/${+moment().toDate()}`
      break
    case 'd':
      timePath += `/${+moment().subtract(1,'d').toDate()}/${+moment().toDate()}`
      break
    case '1m':
      timePath += `/${+moment().subtract(1,'M').toDate()}/${+moment().toDate()}`
      break
    case '3m':
      timePath += `/${+moment().subtract(3,'M').toDate()}/${+moment().toDate()}`
      break
    case '1y':
      timePath += `/${+moment().subtract(1,'y').toDate()}/${+moment().toDate()}`
      break
    case 'ty':
      timePath += `/${+new Date(1483228800000)}/${+moment().toDate()}`
      break
    default:
      timePath = `/${+new Date(1405914258000)}/${+moment().toDate()}`
  }
  return timePath
}
