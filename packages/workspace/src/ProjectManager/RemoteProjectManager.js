import fileOps from '@obsidians/file-ops'
import notification from '@obsidians/notification'
import { HttpIpcChannel } from '@obsidians/ipc'
import { modelSessionManager } from '@obsidians/code-editor'

import BaseProjectManager from './BaseProjectManager'
import Auth from '@obsidians/auth'
import { sortFile } from './helper'
import { t } from '@obsidians/i18n'

const projectChannel = new HttpIpcChannel('project')

export default class RemoteProjectManager extends BaseProjectManager {
  static async createProject (options, stage = '') {
    return await projectChannel.invoke('post', stage, options)
  }

  constructor (project, projectRoot) {
    super(project, projectRoot)

    this.remote = true
    this.prefix = 'private'
    if (this.projectRoot) {
      const projectOwner = this.projectRoot.split('/')[0]
      this.projectOwner = projectOwner
      this.userOwnProject = Auth.profile?.username === projectOwner
      this.isFirstLoad = true
    }
  }

  togglePublic = async (aim = void 0) => {
    if (aim === 'public') this.prefix = 'public'
    if (aim === 'private') this.prefix = 'private'
    const project = await projectChannel.invoke('put', `${this.projectOwner}/${this.projectName}`, {
      public: this.prefix === 'public'
    })
    this.refreshDirectory()
    // await toggleFunction //
    return project.public
  }

  forkToPublic = async (aim = void 0, copiedUserId, copiedProjectId, projectName) => {
    if (aim === 'public') this.prefix = 'public'
    if (aim === 'private') this.prefix = 'private'
    return await projectChannel.invoke('post', `${this.projectOwner}/${this.projectName}`, {
      public: this.prefix === 'public',
      copiedUserId,
      copiedProjectId,
      projectName,
    })
  }

  get path () {
    return fileOps.web.path
  }

  async getProjectInfo () {
    try {
      return await projectChannel.invoke('get', this.projectRoot)
    } catch (e) {
      return { error: e.message }
    }
  }

  async prepareProject () {
    const project = await this.getProjectInfo()
    if (project.error) return { error: project.error }

    this.prefix = project.public ? 'public' : 'private'
    this.projectName = project.name
    this.userId = project.userId
    this.projectId = project._id

    let projectSettings
    try {
      projectSettings = await this.readProjectSettings()
    } catch (e) {
      console.warn(e)
      return { initial: { path: this.pathForProjectFile('README.md'), remote: true, pathInProject: this.pathInProject(this.pathForProjectFile('README.md')) }, projectSettings: null }
    }

    return { initial: { path: this.pathForProjectFile('README.md'), remote: true, pathInProject: this.pathInProject(this.pathForProjectFile('README.md')) }, projectSettings }
  }

  async deleteProject () {
    return await projectChannel.invoke('delete', this.projectRoot)
  }

  pathForProjectFile (relativePath) {
    return this.path.join(`${this.prefix}/${this.userId}/${this.projectId}`, relativePath)
  }

  pathInProject (filePath = '') {
    return filePath.replace(`${this.prefix}/${this.userId}/${this.projectId}`, this.projectName)
  }

  async readProjectSettings () {
    this.projectSettings = new BaseProjectManager.ProjectSettings(this, this.settingsFilePath, BaseProjectManager.channel)
    await this.projectSettings.readSettings()
    return this.projectSettings
  }

  async listFolder (folderPath) {
    return await fileOps.web.listFolder(folderPath, `${this.prefix}/${this.userId}/${this.projectId}/`)
  }

  async loadRootDirectory() {
    const result = await this.listFolder(`${this.prefix}/${this.userId}/${this.projectId}`)
    if (this.isFirstLoad) {
      this.isFirstLoad = false
      const isHasFileREADME = result.length === 0 ? false : result.find(item => item.name === 'README.md')
      !isHasFileREADME && await this.createNewFile(`${this.prefix}/${this.userId}/${this.projectId}`, 'README.md')
    }

    const rawData = result.map(item => ({ ...item, pathInProject: `${this.projectName}/${item.name}` }))
    return {
      name: this.projectName,
      root: true,
      className: '',
      key: `${this.prefix}/${this.userId}/${this.projectId}`,
      title: this.projectName,
      path: `${this.prefix}/${this.userId}/${this.projectId}`,
      pathInProject: this.projectName,
      loading: false,
      children: sortFile(rawData)
    }
  }

  async loadDirectory(node) {
    const result = await this.listFolder(node.path)
    const rawData = result.map(item => ({
      ...item,
      pathInProject: this.pathInProject(item.path)
    }))
    return sortFile(rawData)
  }

  openProjectSettings () {
    this.project.openProjectSettings(this.settingsFilePath)
  }

  get mainFilePath () {
    if (this.projectSettings?.get('main')) {
      return this.pathForProjectFile(this.projectSettings.get('main'))
    }
    throw new Error(t('project.setting.noMainFile'))
  }

  async isMainValid () {
    try {
      return await fileOps.web.isFile(this.mainFilePath)
    } catch (e) {
      return false
    }
  }

  async checkSettings () {
    if (!this.project || !this.projectRoot) {
      notification.error(t('project.setting.noProject'), t('project.setting.openProject'))
      return
    }

    return await this.projectSettings.readSettings()
  }

  async isFile (filePath) {
    return await fileOps.web.isFile(filePath)
  }

  async ensureFile (filePath) {
    return await fileOps.web.fs.ensureFile(filePath)
  }

  async readFile (filePath) {
    return await fileOps.web.readFile(filePath)
  }

  async saveFile (filePath, content) {
    if (!this.userOwnProject) throw new Error(t('project.save.failText'))
    await fileOps.web.writeFile(filePath, content)
  }

  onFileChanged() { }

  checkFileName() {}

  async moveOps() { }

  async hasFileOrFolder(path) {
    if (await fileOps.web.isFile(path) || await fileOps.web.isDirectory(path)) {
      return false
    }
    return true
  }

  async createNewFile (basePath, name) {
    const filePath = this.path.join(basePath, name)

    if (!await this.hasFileOrFolder(filePath)) {
      throw new Error(`File or Folder <b>${name}</b> already exists.`)
    }

    try {
      await this.ensureFile(filePath)
    } catch (e) {
      throw new Error(`Fail to create the file <b>${name}</b>.`)
    }

    await this.refreshDirectory(basePath)
    return filePath
  }

  async createNewFolder(basePath, name) {
    const folderPath = this.path.join(basePath, name)
    if (!await this.hasFileOrFolder(folderPath)) {
      throw new Error(`File or Folder <b>${name}</b> already exists.`)
    }

    try {
      await fileOps.web.fs.ensureDir(folderPath)
    } catch (e) {
      throw new Error(`Fail to create the folder <b>${name}</b>.`)
    }

    await this.refreshDirectory(basePath)
  }

  async rename (oldPath, name, options = {}) {
    const { type } = options
    const isFile = type === 'file'

    const { path, fs } = fileOps.current
    const { dir } = path.parse(oldPath)
    const newPath = isFile ? path.join(dir, name) : path.join(dir, name, '/')
    const oldPathWithType = isFile ? oldPath : path.join(oldPath, '/')

    try {
      await fileOps.web.fs.rename(oldPathWithType, newPath)
      modelSessionManager.updateEditorAfterMovedFile(oldPath, newPath)
    } catch (e) {
      console.log(e)
      throw new Error(`Fail to rename <b>${this.pathInProject(oldPath)}</b>.`)
    }

    await this.refreshDirectory(dir)
  }

  async deleteFile (node) {
    if (node.root) return
    node.children
        ? await fileOps.web.fs.deleteFolder(node.path)
        : await fileOps.web.fs.deleteFile(node.path)

    const { dir } = fileOps.web.path.parse(node.path)
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
