import fileOps from '@obsidians/file-ops'
import notification from '@obsidians/notification'
import { modelSessionManager } from '@obsidians/code-editor'

import BaseProjectManager from './BaseProjectManager'

export default class LocalProjectManager extends BaseProjectManager {
  constructor () {
    super()

    this.project = null
    this.terminalButton = null

    this.channel.on('refresh-file', this.onRefreshFile.bind(this))
  }

  get projectRoot () {
    return this.project?.props.projectRoot
  }

  async prepareProject () {
    if (!await fileOps.current.isDirectory(this.projectRoot)) {
      return { error: 'invalid project' }
    }

    let projectSettings
    try {
      projectSettings = await this.readProjectSettings()
    } catch (e) {
      console.warn(e)
      return { initialFile: this.settingsFilePath, projectSettings: null }
    }

    if (await this.isMainValid()) {
      return { initialFile: this.mainFilePath, projectSettings }
    }
    return { initialFile: this.settingsFilePath, projectSettings }
  }

  pathForProjectFile (relativePath) {
    return this.projectRoot ? fileOps.current.path.join(this.projectRoot, relativePath) : ''
  }

  async loadRootDirectory () {
    return await this.channel.invoke('loadTree', this.projectRoot)
  }

  async loadDirectory () {
    return await this.channel.invoke('loadDirectory', this.projectRoot)
  }

  onRefreshDirectory (callback) {
    this.channel.on('refresh-directory', callback)
  }

  offRefreshDirectory () {
    this.channel.off('refresh-directory')
  }

  async readProjectSettings () {
    this.projectSettings = new BaseProjectManager.ProjectSettings(this.settingsFilePath, this.channel)
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

  onRefreshFile (data) {
    modelSessionManager.refreshFile(data)
    if (data.path === this.settingsFilePath) {
      this.projectSettings?.update(data.content)
    }
  }

  toggleTerminal (terminal) {
    this.terminalButton?.setState({ terminal })
    this.project?.toggleTerminal(terminal)
  }

  effect (key, callback) {
    return () => this.channel.on(key, callback)
  }
}
