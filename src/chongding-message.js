const Publisher = require('./rabbitmq.js')
const publisher = new Publisher()
const _ = require('lodash')

let resolved = false
let lastQuestionStatus = {}
const chongdingGroup = '@@920b39fc7b879beda75d85eff9effe63fbcccd730b17a12bc0230cba37ba59c1'
// const chongdingGroup = '@@02e6e957f8999846ef597bfbe166dd88e99eca4d2c05e004f43480d56c47779d'

function getMostLike(msg) {
  const counts = _.map(msg.counts, c => Number(c))
  if (!_.sum(counts)) return null
  if (msg.choices.length > 2) {
    if (~msg.question.indexOf('不是') || ~msg.question.indexOf('不包') || ~msg.question.indexOf('没有')) {

      return counts.indexOf(_.min(counts)) + 1
    } else {
      const counts = _.map(msg.counts, c => Number(c))
      return counts.indexOf(_.max(counts)) + 1
    }
  }
  return null
}

module.exports = (bot) => {
  publisher.connect().then(queue => {
    queue((msg) => {
      const answerIndex = getMostLike(msg)
      console.log('answerIndex', answerIndex)
      if (!answerIndex) {
        console.log('没有找到答案')
        return
      }

      if (msg.way === 2) {
        setTimeout(() => {
          if (!lastQuestionStatus[msg.question]) {
            const answer = `有可能是： ${answerIndex}`
            console.log(answer)
            bot.sendText(chongdingGroup, answer)
          } else {
            console.log('已经被解决')
          }
        }, 300)
      }

      if (msg.way === 3) {
        const answer = `极有可能是： ${answerIndex}`
        bot.sendText(chongdingGroup, answer)
        lastQuestionStatus[msg.question] = true
      }
    })
  })
}
