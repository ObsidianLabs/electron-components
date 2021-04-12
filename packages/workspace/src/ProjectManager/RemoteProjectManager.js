import fileOps from '@obsidians/file-ops'
import notification from '@obsidians/notification'

import BaseProjectManager from './BaseProjectManager'

export default class RemoteProjectManager extends BaseProjectManager {
  constructor (project, projectRoot) {
    super(project, projectRoot)

    this.prefix = 'private'
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
    return fileOps.current.path.join(`${this.prefix}/${this.userId}/${this.projectId}`, relativePath)
  }

  pathInProject (filePath = '') {
    return filePath.replace(`${this.prefix}/${this.userId}/${this.projectId}`, this.projectName)
  }

  async readProjectSettings () {
    this.projectSettings = new BaseProjectManager.ProjectSettings(this.settingsFilePath, BaseProjectManager.channel)
    await this.projectSettings.readSettings()
    return this.projectSettings
  }

  async loadRootDirectory () {
    const result = await fileOps.current.listFolder(`${this.prefix}/${this.userId}/${this.projectId}`)
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
    const result = await fileOps.current.listFolder(node.path)
    return result.map(item => ({
      ...item,
      pathInProject: this.pathInProject(item.path)
    }))
  }

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

  async createNewFile (basePath, name) {
    const filePath = fileOps.current.path.join(basePath, name)
    if (await fileOps.current.isFile(filePath)) {
      throw new Error(`File <b>${this.pathInProject(filePath)}</b> already exists.`)
    }
  
    try {
      await fileOps.current.fs.ensureFile(filePath)
    } catch (e) {
      throw new Error(`Fail to create the file <b>${this.pathInProject(filePath)}</b>.`)
    }

    await this.refreshDirectory(basePath)
    return filePath
  }

  async createNewFolder (basePath, name) {
    const folderPath = fileOps.current.path.join(basePath, name)
  
    try {
      await fileOps.current.fs.ensureDir(folderPath)
    } catch (e) {
      throw new Error(`Fail to create the folder <b>${this.pathInProject(folderPath)}</b>.`)
    }

    await this.refreshDirectory(basePath)
  }

  async rename (oldPath, name) {
    const { path, fs } = fileOps.current
    const { dir } = path.parse(oldPath)
    const newPath = path.join(dir, name)

    try {
      await fs.rename(oldPath, newPath)
    } catch (e) {
      throw new Error(`Fail to rename <b>${this.pathInProject(folderPath)}</b>.`)
    }

    await this.refreshDirectory(dir)
  }

  async deleteFile (node) {
    const { response } = await fileOps.current.showMessageBox({
      message: `Are you sure you want to delete ${node.pathInProject}?`,
      buttons: ['Delete', 'Cancel']
    })
    if (response === 0) {
      if (node.children) {
        await fileOps.current.fs.deleteFolder(node.path)
      } else {
        await fileOps.current.fs.deleteFile(node.path)
      }
    }

    const { dir } = fileOps.current.path.parse(node.path)
    await this.refreshDirectory(dir)
  }

  async refreshDirectory (dir = `${this.prefix}/${this.userId}/${this.projectId}`) {
    const children = await this.loadDirectory({ path: dir })
    BaseProjectManager.channel.trigger('refresh-directory', { path: dir, children })
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
