import { IpcChannel } from '@obsidians/ipc'

export default class BaseProjectManager {
  static ProjectSettings = null
  static channel = new IpcChannel('project')
  static terminalButton = null
  static instance = null

  constructor (project, projectRoot) {
    BaseProjectManager.instance = this
    this.project = project
    this.projectRoot = projectRoot
  }

  dispose () {}

  get settingsFilePath () {
    throw new Error('ProjectManager.settingsFilePath is not implemented.')
  }

  onRefreshDirectory (callback) {
    BaseProjectManager.channel.on('refresh-directory', callback)
  }

  offRefreshDirectory () {
    BaseProjectManager.channel.off('refresh-directory')
  }

  refreshDirectory () {}

  static effect (evt, callback) {
    return () => {
      const dispose = BaseProjectManager.channel.on(evt, callback)
      BaseProjectManager.channel.trigger('current-value', evt)
      return dispose
    }
  }
}
