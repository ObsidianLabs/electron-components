import fileOps from '@obsidians/file-ops'
import notification from '@obsidians/notification'

import BaseProjectManager from './BaseProjectManager'

export default class RemoteProjectManager extends BaseProjectManager {
  constructor (project, projectRoot) {
    super(project, projectRoot)

    this.prefix = 'public'
  }

  async prepareProject () {
    let project
    try {
      project = await BaseProjectManager.channel.invoke('get', this.projectRoot)
    } catch (e) {
      return { error: e.message }
    }

    this.projectName = project.name
    this.userId = project.userId
    this.projectId = project._id

    let projectSettings
    try {
      projectSettings = await this.readProjectSettings()
    } catch (e) {
      console.warn(e)
      return { initial: { path: this.pathForProjectFile('README.md'), remote: true }, projectSettings: null }
    }

    return { initial: { path: this.pathForProjectFile('README.md'), remote: true }, projectSettings }
  }

  pathForProjectFile (relativePath) {
    return `${this.prefix}/${this.userId}/${this.projectId}/${relativePath}`
  }

  async readProjectSettings () {
    this.projectSettings = new BaseProjectManager.ProjectSettings(this.settingsFilePath, BaseProjectManager.channel)
    await this.projectSettings.readSettings()
    return this.projectSettings
  }

  async loadRootDirectory () {
    const result = await fileOps.current.fs.list(`${this.prefix}/${this.userId}/${this.projectId}`)
    return {
      name: this.projectName,
      root: true,
      path: `${this.prefix}/${this.userId}/${this.projectId}`,
      pathInProject: this.projectName,
      loading: false,
      children: result.map(item => ({ ...item, pathInProject: `${this.projectName}/${item.name}` }))
    }
  }

  async loadDirectory (node) {
    const result = await fileOps.current.fs.list(node.path)
    return result.map(item => ({ ...item, pathInProject: `${node.pathInProject}/${item.name}` }))
  }

  onRefreshDirectory () {}

  offRefreshDirectory () {}

  openProjectSettings () {
    this.project.openProjectSettings(this.settingsFilePath)
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
    BaseProjectManager.terminalButton?.setState({ terminal })
    this.project.toggleTerminal(terminal)
  }
}
