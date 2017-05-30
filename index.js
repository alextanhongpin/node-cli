#!/usr/bin/env node --harmony
// Add backward compatible with the harmony flag

const program = require('commander')
const co = require('co')
const prompt = require('co-prompt')
const request = require('request')
const nock = require('nock')
const chalk = require('chalk')
const ProgressBar = require('progress')

nock.disableNetConnect()
nock('https://server.org')
.post('/auth', {
  username: 'john.doe',
  password: '123456'
})
.delayBody(2000)
.reply(200, {
  message: 'You got something!'
})

const barOptions = {
  width: 20,
  total: 100,
  clear: true,
  complete: '=',
  incomplete: ' '
}

const bar = new ProgressBar('  downloading [:bar] :rate/bps :percent :etas', barOptions)

program
  .arguments('<file>')
  .option('-u, --username <username>', 'The user to authenticate as')
  .option('-p, --password <password>', 'The user\'s password')
  .action((file) => {
    co(function *() {
      const username = yield prompt('username:')
      const password = yield prompt.password('password:')

      const timer = setInterval(() => {
        bar.tick()
        if (bar.curr === 100 - 10) {
          clearInterval(timer)
        }
      }, 10)
      request({
        url: 'https://server.org/auth',
        method: 'POST',
        json: true,
        body: {
          username,
          password
        }
      }, (error, response, body) => {
        if (!error && response.statusCode === 200) {
          bar.tick(10)
          console.log(chalk.bold.cyan('Success:') + ' Call to server success!')
          process.exit(0)
        } else {
          console.error(chalk.red('Authentication failed! Wrong username/password?'))
          process.exit(1)
        }
      })
    })
  })
  .parse(process.argv)
