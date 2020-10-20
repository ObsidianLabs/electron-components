import fileOps from '@obsidians/file-ops'
import notification from '@obsidians/notification'

import BaseProjectManager from './BaseProjectManager'

export default class RemoteProjectManager extends BaseProjectManager {
  constructor () {
    super()

    this.project = null
    this.terminalButton = null
  }

  get projectRoot () {
    return this.project?.props.projectRoot
  }

  async prepareProject () {
    let project
    try {
      project = await this.channel.invoke('get', this.projectRoot)
    } catch (e) {
      return { error: e.message }
    }

    this.projectId = project._id

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
    return `${this.projectId}/${relativePath}`
  }

  async readProjectSettings () {
    this.projectSettings = new BaseProjectManager.ProjectSettings(this.settingsFilePath, this.channel)
    await this.projectSettings.readSettings()
    return this.projectSettings
  }

  async loadRootDirectory () {
    const result = await fileOps.current.fs.list(this.projectId)
    return {
      name: this.projectRoot,
      root: true,
      path: this.projectId,
      loading: false,
      children: []
    }
  }

  async loadDirectory () {
    return await this.channel.invoke('loadDirectory', this.projectRoot)
  }

  onRefreshDirectory () {}

  offRefreshDirectory () {}

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
