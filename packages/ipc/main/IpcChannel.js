const { ipcMain, net } = require('electron')
const qs = require('qs')

const ipc = require('./ipc')
const ChildProcess = require('./ChildProcess')

class IpcChannel {
  constructor(channel = 'default', uid = '') {
    this.ipc = ipc
    this.channel = channel
    this.uid = uid
    this.cp = new ChildProcess()
    this.start()
  }

  get channelName() {
    if (this.uid) {
      return `obsidians-ipc-${this.channel}-${this.uid}`
    } else {
      return `obsidians-ipc-${this.channel}`
    }
  }

  get channelResponse() {
    if (this.uid) {
      return `obsidians-ipc-response-${this.channel}-${this.uid}`
    } else {
      return `obsidians-ipc-response-${this.channel}`
    }
  }

  start () {
    if (!this.channel) {
      throw new Error(`Not a valid IpcChannel (channel name: ${this.channel}`)
    }
    ipcMain.handle(this.channelName, (_, method, args) => this.onRequest(method, args))
  }

  dispose () {
    ipcMain.removeHandler(this.channelName)
  }

  async onRequest (method, args) {
    if (!this[method]) {
      throw new Error(`Method ${method} is not defined for channel ${this.channel}`)
    }
    return this[method](...args)
  }

  send (method, ...data) {
    this.ipc.send(this.channelResponse, method, ...data)
  }

  async exec (command, config) {
    if (!command.trim()) {
      return
    }
    return await this.cp.exec(command.trim(), config)
  }

  async fetch (url, params) {
    if (params) {
      url = url + `?` + qs.stringify(params)
    }
    return await new Promise((resolve, reject) => {
      const request = net.request(url)
      request.on('response', (response) => {
        let body = ''
        response.on('data', chunk => {
          body += chunk
        })
        response.on('end', () => resolve(body))
      })
      request.end()
    })
  }
}

module.exports = IpcChannel