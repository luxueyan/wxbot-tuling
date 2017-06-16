const chalk = require('chalk')

const logger = function(msg) {
  console.log(msg)
}

logger.info = function(msg) {
  console.log(chalk.green(msg))
}

logger.error = function(msg) {
  console.log(chalk.red(msg))
}

logger.warn = function(msg) {
  console.log(chalk.yellow(msg))
}

logger.log = function(msg) {
  console.log(msg)
}

module.exports = logger
