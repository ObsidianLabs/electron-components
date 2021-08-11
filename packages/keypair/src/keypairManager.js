import { IpcChannel } from '@obsidians/ipc'
import redux from '@obsidians/redux'
import notification from '@obsidians/notification'

class KeypairManager {
  constructor () {
    this.channel = new IpcChannel('keypair')
    this.onKeypairUpdated = null
    this.eventTarget = new EventTarget()
    this._kp = null
  }

  set kp (kp) { this._kp = kp }
  get kp () { return this._kp }

  onUpdated (callback) {
    const eventHandler = event => callback(event.detail)
    this.eventTarget.addEventListener('updated', eventHandler)
  }

  async loadAllKeypairs () {
    try {
      const keypairs = await this.channel.invoke('get')
      const names = redux.getState().keypairs
      const unsorted = keypairs.map(k => ({ address: k.address, name: k.name || names.get(k.address) }))
      const sorted = unsorted.sort((a, b) => {
        if (!a.name || !b.name) {
          return 0
        }
        return a.name.localeCompare(b.name)
      })
      return sorted
    } catch (e) {
      // notification.error('Error', e.message)
      return []
    }
  }

  async newKeypair (kp, chain, secretType) {
    return kp.newKeypair(chain, secretType)
  }

  async loadAndUpdateKeypairs () {
    const keypairs = await this.loadAllKeypairs()
    const event = new CustomEvent('updated', { detail: keypairs })
    this.eventTarget.dispatchEvent(event)
  }

  async saveKeypair (name, keypair) {
    keypair.name = name
    await this.channel.invoke('post', '', keypair)
    redux.dispatch('UPDATE_KEYPAIR_NAME', { address: keypair.address, name })
    await this.loadAndUpdateKeypairs()
  }

  async updateKeypairName (address, name) {
    redux.dispatch('UPDATE_KEYPAIR_NAME', { address, name })
    await this.channel.invoke('put', address, { name })
    await this.loadAndUpdateKeypairs()

  }

  async deleteKeypair (keypair) {
    await this.channel.invoke('delete', keypair.address)
    redux.dispatch('REMOVE_KEYPAIR_NAME', { address: keypair.address })
    await this.loadAndUpdateKeypairs()

  }

  async getKeypair (address) {
    const keypair = await this.channel.invoke('get', address)
    if (!keypair) {
      throw new Error(`No keypair for <b>${address}</b>`)
    }
    return keypair
  }

  async getSecret (address, key = 'secret') {
    const keypair = await this.getKeypair(address)
    if (!keypair[key]) {
      throw new Error(`No ${key} for <b>${address}</b>`)
    }
    return keypair[key]
  }
}

export default new KeypairManager()