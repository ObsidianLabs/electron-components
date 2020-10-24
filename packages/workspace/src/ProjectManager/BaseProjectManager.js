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

  get settingsFilePath () {
    throw new Error('ProjectManager.settingsFilePath is not implemented.')
  }

  static effect (key, callback) {
    return () => BaseProjectManager.channel.on(key, callback)
  }
}
