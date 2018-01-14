const amqp = require('amqp')
const debug = require('debug')('weixinbot')
const connection = amqp.createConnection({ host: '127.0.0.1' })

class Publisher {
  construct() {
    this.connection = null
    this.connect()
  }
  async connect() {
    this.connection = amqp.createConnection({ host: '127.0.0.1' })
    // add this for better debuging

    // Wait for connection to become established.
    return new Promise((resolve, reject) => {
      this.connection.on('ready', () => {
        console.log('rabbitmq connection ready')
        resolve(this.queue.bind(this))
      })
      this.connection.on('error', (e) => {
        console.log("Error from amqp: ", e)
        reject(e)
      })
    })
  }
  async queue(callback) {
    this.connection.queue('chongding', { autoDelete: false }, function(q) {
      // Catch all messages
      q.bind('#')

      console.log('chongding is bind')
      // Receive messages
      q.subscribe(function(message) {
        // Print messages to stdout
        console.log(message)
        callback(message)
        // callback(message)
      })
    })
  }
}

// function(callback) {
//   // Use the default 'amq.topic' exchange
//   connection.queue('chongding', function(q) {
//     // Catch all messages
//     q.bind('#')

//     console.log('chongding is bind')
//     // Receive messages
//     q.subscribe(function(message) {
//       // Print messages to stdout
//       debug(message)
//       callback(message)
//     })
//   })
// }
module.exports = Publisher
