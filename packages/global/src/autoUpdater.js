import { IpcChannel } from '@obsidians/ipc'
import globalModalManager from './modals/globalModalManager'

class AutoUpdater {
  constructor () {
    this.channel = new IpcChannel('auto-update')
    this.onData = this.onData.bind(this)
    this.onStatus = this.onStatus.bind(this)
    this.channel.onData(this.onData)
  }

  check () {
    this.channel.invoke('check')
  }

  onData (method, args) {
    switch (method) {
      case 'status':
        this.onStatus(args[0])
    }
  }

  async onStatus (status) {
    switch (status.type) {
      case 'update-downloaded':
        const version = status.info.version
        const updateNow = await globalModalManager.openAutoUpdateModal(version)
        if (updateNow) {
          this.channel.invoke('updateNow')
        }
        break
      default:
        console.debug(status)
    }
  }
}

export default new AutoUpdater()
