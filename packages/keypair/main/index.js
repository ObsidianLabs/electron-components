const keytar = require('keytar')
const { randomBytes } = require('crypto')

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
    const privKey = randomBytes(32).toString('hex')
    return `0x${privKey}`
  }

  async saveKeypair (address, secret) {
    await keytar.setPassword(`@obsidians/${this.build}-keypair`, address, secret)
  }

  async deleteKeypair(address) {
    await keytar.deletePassword(`@obsidians/${this.build}-keypair`, address)
  }
}

module.exports = KeypairManager
