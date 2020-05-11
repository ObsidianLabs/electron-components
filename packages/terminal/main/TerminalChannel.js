const { IpcChannel } = require('@obsidians/ipc')

class TerminalChannel extends IpcChannel {
  constructor (uid) {
    super('terminal', uid)
  }

  resize ({ cols, rows }) {
    this.pty.resize({ cols, rows })
  }

  async kill () {
    return new Promise(resolve => {
      setTimeout(resolve, 2000)
      this.pty.kill().then(resolve)
    })
  }
}
module.exports = TerminalChannel