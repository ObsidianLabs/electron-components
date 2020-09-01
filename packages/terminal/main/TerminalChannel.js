const { IpcChannel } = require('@obsidians/ipc')
const Pty = require('@obsidians/pty')

class TerminalChannel extends IpcChannel {
  constructor (uid, cwd) {
    super('terminal', uid)
    this.pty = new Pty(this, cwd)
  }

  async run (command, config) {
    if (!command.trim()) {
      return
    }
    return await this.pty.run(command.trim(), config)
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