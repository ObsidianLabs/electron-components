import fileOps from '@obsidians/file-ops'
import notification from '@obsidians/notification'
import { IpcChannel } from '@obsidians/ipc'
import { modelSessionManager } from '@obsidians/code-editor'

export default class ProjectManager {
  constructor () {
    this.project = null
    this.terminalButton = null
    this.channel = new IpcChannel('project')

    this.onRefreshFile = this.onRefreshFile.bind(this)
    modelSessionManager.onRefreshFile(this.onRefreshFile)
  }

  get projectRoot () {
    return this.project?.props.projectRoot
  }

  pathForProjectFile (relativePath) {
    return this.projectRoot ? fileOps.current.path.join(this.projectRoot, relativePath) : ''
  }

  async readProjectSettings () {
    this.projectSettings = new this.ProjectSettings(this.settingsFilePath, this.channel)
    await this.projectSettings.readSettings()
    return this.projectSettings
  }

  openProjectSettings () {
    this.project?.openProjectSettings()
  }

  get mainFilePath () {
    if (this.projectSettings?.get('main')) {
      return this.pathForProjectFile(this.projectSettings.get('main'))
    }
    throw new Error('No main file in project settings')
  }

  async isMainValid () {
    try {
      return await fileOps.current.isFile(this.mainFilePath)
    } catch (e) {
      return false
    }
  }

  async checkSettings () {
    if (!this.project || !this.projectRoot) {
      notification.error('No Project', 'Please open a project first.')
      return
    }

    return await this.projectSettings.readSettings()
  }

  toggleTerminal (terminal) {
    this.terminalButton?.setState({ terminal })
    this.project?.toggleTerminal(terminal)
  }

  onRefreshFile (data) {
    if (data.path === this.settingsFilePath) {
      this.projectSettings?.update(data.content)
    }
  }

  effect (key, callback) {
    return () => this.channel.on(key, callback)
  }
}
