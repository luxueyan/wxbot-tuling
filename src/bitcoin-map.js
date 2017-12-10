const moment = require('moment')

const bitcoinMap = {
  eth: 'ethereum',
  btc: 'bitcoin',
  bch: 'bitcoin-cash',
  iota: 'iota',
  xrp: 'ripple',
  ltc: 'litecoin',
  dash: 'dash',
  btg: 'bitcoin-gold',
  xmr: 'monero',
  xem: 'nem',
  ada: 'cardano',
  etc: 'ethereum-classic',
  xlm: 'stellar',
  neo: 'neo',
  eos: 'eos',
  bcc: 'bitconnect',
  ppt: 'populous',
  lsk: 'lisk',
  stratis: 'stratis',
  zec: 'zcash',
  qtum: 'qtum',
  omg: 'omisego',
  waves: 'waves',
  mage: 'magiccoin',
  usdt: 'tether',
  mona: 'monacoin',
  hsr: 'hshare',
  nxt: 'nxt',
  ardr: 'ardor',
  bts: 'bitshares',
  bcn: 'bytecoin-bcn',
  xuc: 'exchange-union',
  emc2: 'einsteinium',
  steem: 'steem',
  salt: 'salt',
  ark: 'ark',
  vtc: 'vertcoin',
  vrei: 'veritaseum',
  kmd: 'komodo',
  dcr: 'decred',
  rep: 'augur',
  doge: 'dogecoin',
  trx: 'tron',
  gnt: 'golem-network-tokens',
  pivx: 'pivx',
  sc: 'siacoin',
  qash: 'qash',
  bnb: 'binance-coin',
  maid: 'maidsafecoin',
  pay: 'tenx',
  wtc: 'walton',
  power: 'power-ledger',
  snt: 'status',
  dgd: 'digixdao',
  etn: 'electroneum',
  frst: 'firstcoin',
  btcd: 'bitcoindark',
  ink: 'ink',
  fct: 'factom',
  gbyte: 'byteball',
  sys: 'syscoin',
  bat: 'basic-attention-token',
  knc: 'kyber-network',
  rdn: 'raiden-network-token',
  cnx: 'cryptonex',
  san: 'santiment',
  hyp: 'hyperpay',
  btm: 'bytom',
  gas: 'gas',
  xzc: 'zcoin',
  mco: 'monaco',
  icn: 'iconomi',
  ven: 'vechain',
  ae: 'aeternity',
  dgb: 'digibyte',
  pura: 'pura',
  rec: 'regalcoin',
  run: 'funfair',
  gno: 'gnosis',
  game: 'gamecredits',
  zrx: '0x',
  xvg: 'verge',
  mana: 'decentraland',
  block: 'blocknet',
  dgrn: 'dragonchain',
  bnt: 'bancor',
  cvc: 'civic',
  cmt: 'cybermiles',
  mtl: 'metal',
  storj: 'storj',
  bqx: 'bitquence',
  aion: 'aion',
  nav: 'nav-coin',
  xrb: 'raiblocks',
  nxs: 'nexus',
  gxs: 'gxshares',
  edg: 'edgeless',
  data: 'streamr',
  sky: 'skycoin',
  etp: 'metaverse',
  yoyow: 'yoyow',
  oct: 'oraclechain'
}

const CHART_TYPE = { SUMMARY: 1, DETAIL: 2 }
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
