import { IpcChannel } from '@obsidians/ipc'
import redux from '@obsidians/redux'

import { kp } from '@obsidians/sdk'

class KeypairManager {
  constructor (build) {
    this.channel = new IpcChannel(`${build}-keypair`)
  }

  async loadAllKeypairs () {
    const addresses = await this.channel.invoke('allKeypairAddresses')
    const names = redux.getState().keypairs
    return addresses.map(address => ({ address, name: names.get(address) }))
  }
  
  async newKeypair () {
    return kp.newKeypair()
  }

  async saveKeypair(name, keypair) {
    await this.channel.invoke('saveKeypair', keypair.address, keypair.secret)
    this.updateKeypairName(keypair.address, name)
  }

  updateKeypairName (address, name) {
    redux.dispatch('UPDATE_KEYPAIR_NAME', { address, name })
  }

  async deleteKeypair(keypair) {
    await this.channel.invoke('deleteKeypair', keypair.address)
    redux.dispatch('REMOVE_KEYPAIR_NAME', { address: keypair.address })
  }

  async getSigner(address) {
    const secret = await this.channel.invoke('loadSecret', address)
    if (!secret) {
      throw new Error('No secret key for address: ' + address)
    }
    return secret
  }
}

export default new KeypairManager(process.env.BUILD)