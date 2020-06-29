const keytar = require('keytar')

const { IpcChannel } = require('@obsidians/ipc')

class KeypairManager extends IpcChannel {
  constructor(build) {
    super(`${build}-keypair`)
    this.build = build
  }

  async allKeypairAddresses () {
    const keys = await keytar.findCredentials(`@obsidians/${this.build}-keypair`)
    return keys.map(({ account }) => account)
  }

  async loadSecret (address) {
    const secret = await keytar.getPassword(`@obsidians/${this.build}-keypair`, address)
    if (secret) {
      return secret
    }
  }

  async newSecret () {
    const { logs: secret } = await this.pty.exec('openssl rand -hex 32')
    return `0x${secret.trim()}`
  }

  async saveKeypair (address, secret) {
    await keytar.setPassword(`@obsidians/${this.build}-keypair`, address, secret)
  }

  async deleteKeypair(address) {
    await keytar.deletePassword(`@obsidians/${this.build}-keypair`, address)
  }
}

module.exports = KeypairManager
