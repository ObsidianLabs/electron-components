import { IpcChannel } from '@obsidians/ipc'
import redux from '@obsidians/redux'
import notification from '@obsidians/notification'

import { kp } from '@obsidians/sdk'

class KeypairManager {
  constructor () {
    this.channel = new IpcChannel('keypair')
    this.onKeypairUpdated = null
    this.eventTarget = new EventTarget()
  }

  onUpdated (callback) {
    const eventHandler = event => callback(event.detail)
    this.eventTarget.addEventListener('updated', eventHandler)
  }

  async loadAllKeypairs () {
    try {
      const addresses = await this.channel.invoke('get')
      const names = redux.getState().keypairs
      return addresses.map(address => ({ address, name: names.get(address) }))
    } catch (e) {
      notification.error('Error', e.message)
      return []
    }
  }
  
  async newKeypair () {
    return kp.newKeypair()
  }

  async saveKeypair (name, keypair) {
    await this.channel.invoke('post', '', keypair)
    await this.updateKeypairName(keypair.address, name)
  }

  async updateKeypairName (address, name) {
    redux.dispatch('UPDATE_KEYPAIR_NAME', { address, name })
    const keypairs = await this.loadAllKeypairs()
    const event = new CustomEvent('updated', { detail: keypairs })
    this.eventTarget.dispatchEvent(event)
  }

  async deleteKeypair (keypair) {
    await this.channel.invoke('delete', keypair.address)
    redux.dispatch('REMOVE_KEYPAIR_NAME', { address: keypair.address })
    const keypairs = await this.loadAllKeypairs()
    const event = new CustomEvent('updated', { detail: keypairs })
    this.eventTarget.dispatchEvent(event)
  }

  async getSigner (address) {
    const { secret } = await this.channel.invoke('get', address)
    if (!secret) {
      throw new Error('No secret key for address: ' + address)
    }
    return secret
  }
}

export default new KeypairManager(process.env.BUILD)