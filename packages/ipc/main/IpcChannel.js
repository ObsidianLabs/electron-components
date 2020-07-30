const { ipcMain, net } = require('electron')
const Pty = require('@obsidians/pty')

const ipc = require('./ipc')

class IpcChannel {
  constructor(channel = 'default', uid = '') {
    this.ipc = ipc
    this.channel = channel
    this.uid = uid
    this.pty = new Pty(this)
    this.start()
  }

  get channelName() {
    return `obsidians-ipc-${this.channel}-${this.uid}`
  }

  get channelResponse() {
    return `obsidians-ipc-response-${this.channel}-${this.uid}`
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
    const result = await this.pty.exec(command.trim(), config)
    return result
  }

  async cp (command, config) {
    if (!command.trim()) {
      return
    }
    const result = await this.pty.cp(command.trim(), config)
    return result
  }

  async fetch (url) {
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