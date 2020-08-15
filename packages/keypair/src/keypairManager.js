import { IpcChannel } from '@obsidians/ipc'
import redux from '@obsidians/redux'

import { kp } from '@obsidians/sdk'

class KeypairManager {
  constructor (build) {
    this.channel = new IpcChannel(`${build}-keypair`)
    this.onKeypairUpdated = null
    this.eventTarget = new EventTarget()
  }

  onUpdated (callback) {
    const eventHandler = event => callback(event.detail)
    this.eventTarget.addEventListener('updated', eventHandler)
  }

  async loadAllKeypairs () {
    const addresses = await this.channel.invoke('allKeypairAddresses')
    const names = redux.getState().keypairs
    return addresses.map(address => ({ address, name: names.get(address) }))
  }
  
  async newKeypair () {
    return kp.newKeypair()
  }

  async saveKeypair (name, keypair) {
    await this.channel.invoke('saveKeypair', keypair.address, keypair.secret)
    await this.updateKeypairName(keypair.address, name)
  }

  async updateKeypairName (address, name) {
    redux.dispatch('UPDATE_KEYPAIR_NAME', { address, name })
    const keypairs = await this.loadAllKeypairs()
    const event = new CustomEvent('updated', { detail: keypairs })
    this.eventTarget.dispatchEvent(event)
  }

  async deleteKeypair (keypair) {
    await this.channel.invoke('deleteKeypair', keypair.address)
    redux.dispatch('REMOVE_KEYPAIR_NAME', { address: keypair.address })
    const keypairs = await this.loadAllKeypairs()
    const event = new CustomEvent('updated', { detail: keypairs })
    this.eventTarget.dispatchEvent(event)
  }

  async getSigner (address) {
    const secret = await this.channel.invoke('loadSecret', address)
    if (!secret) {
      throw new Error('No secret key for address: ' + address)
    }
    return secret
  }
}

export default new KeypairManager(process.env.BUILD)