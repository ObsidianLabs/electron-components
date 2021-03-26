import fileOps from '@obsidians/file-ops'
import notification from '@obsidians/notification'
import { modelSessionManager } from '@obsidians/code-editor'
import { t } from '@obsidians/i18n'

import BaseProjectManager from './BaseProjectManager'

export default class LocalProjectManager extends BaseProjectManager {
  constructor (project, projectRoot) {
    super(project, projectRoot)

    BaseProjectManager.channel.on('refresh-file', this.onRefreshFile.bind(this))
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
      return { initial: { path: this.settingsFilePath }, projectSettings: null }
    }

    if (await this.isMainValid()) {
      return { initial: { path: this.mainFilePath }, projectSettings }
    }
    return { initial: { path: this.settingsFilePath }, projectSettings }
  }

  pathForProjectFile (relativePath) {
    return this.projectRoot ? fileOps.current.path.join(this.projectRoot, relativePath) : ''
  }

  async loadRootDirectory () {
    return await BaseProjectManager.channel.invoke('loadTree', this.projectRoot)
  }

  async loadDirectory (node) {
    return await BaseProjectManager.channel.invoke('loadDirectory', node.path)
  }

  async readProjectSettings () {
    this.projectSettings = new BaseProjectManager.ProjectSettings(this.settingsFilePath, BaseProjectManager.channel)
    await this.projectSettings.readSettings()
    return this.projectSettings
  }

  openProjectSettings () {
    this.project.openProjectSettings(this.settingsFilePath)
  }

  get mainFilePath () {
    if (this.projectSettings?.get('main')) {
      return this.pathForProjectFile(this.projectSettings.get('main'))
    }
    throw new Error(t('workspace.error.noMainFile'))
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
      notification.error(t('workspace.error.noProject'), t('workspace.error.noProjectMessage'))
      return
    }

    return await this.projectSettings.readSettings()
  }

  async createNewFile (basePath, name) {
    const filePath = fileOps.current.path.join(basePath, name)
    if (await fileOps.current.isFile(filePath)) {
      throw new Error(t('workspace.error.fileExists', { file: filePath }))
    }

    try {
      await fileOps.current.fs.ensureFile(filePath)
    } catch (e) {
      if (e.code === 'EISDIR') {
        throw new Error(t('workspace.error.folderExists', { folder: filePath }))
      } else {
        throw new Error(t('workspace.error.createFileFailed', { file: filePath }))
      }
    }
  }

  async createNewFolder (basePath, name) {
    const folderPath = fileOps.current.path.join(basePath, name)
    if (await fileOps.current.isDirectory(folderPath)) {
      throw new Error(t('workspace.error.folderExists', { folder: folderPath }))
    }

    try {
      await fileOps.current.fs.ensureDir(folderPath)
    } catch (e) {
      if (e.code === 'EISDIR') {
        throw new Error(t('workspace.error.fileExists', { file: folderPath }))
      } else {
        throw new Error(t('workspace.error.createFolderFailed', { folder: folderPath }))
      }
    }
  }

  async deleteFile (node) {
    const { response } = await fileOps.current.showMessageBox({
      message: t('workspace.delete.fileConfirm', { file: node.path }),
      buttons: [t('button.trash'), t('button.cancel')]
    })
    if (response === 0) {
      await fileOps.current.deleteFile(node.path)
    }
  }

  onRefreshFile (data) {
    modelSessionManager.refreshFile(data)
    if (data.path === this.settingsFilePath) {
      this.projectSettings?.update(data.content)
    }
  }

  toggleTerminal (terminal) {
    BaseProjectManager.terminalButton?.setState({ terminal })
    this.project.toggleTerminal(terminal)
  }
}
