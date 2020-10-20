import { IpcChannel } from '@obsidians/ipc'

export default class BaseProjectManager {
  static ProjectSettings = null

  constructor () {
    this.channel = new IpcChannel('project')
  }
}
