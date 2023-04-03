import fileOps from '@obsidians/file-ops'
import notification from '@obsidians/notification'
import { modelSessionManager } from '@obsidians/code-editor'

import BaseProjectManager from './BaseProjectManager'
import { sortFile } from './helper'

export default class LocalProjectManager extends BaseProjectManager {
  static async createProject(options, stage = '') {
    return await BaseProjectManager.channel.invoke('post', stage, options)
  }

  constructor(project, projectRoot) {
    super(project, projectRoot)

    BaseProjectManager.channel.on('refresh-file', this.onRefreshFile.bind(this))
    BaseProjectManager.channel.on('delete-file', this.onDeleteFile.bind(this))
  }

  dispose() {
    BaseProjectManager.channel.off('refresh-file')
    BaseProjectManager.channel.off('delete-file')
  }

  get path() {
    return fileOps.current.path
  }

  async prepareProject() {
    if (!await fileOps.current.isDirectory(this.projectRoot)) {
      return { error: 'invalid project' }
    }

    let projectSettings
    try {
      projectSettings = await this.readProjectSettings()
    } catch (e) {
      console.warn(e)
      return { initial: { path: this.settingsFilePath, pathInProject: this.settingsFilePath }, projectSettings: null }
    }
    return { initial: { path: this.pathForProjectFile('README.md'), pathInProject: this.settingsFilePath }, projectSettings }
  }

  pathForProjectFile(relativePath) {
    return this.projectRoot ? fileOps.current.path.join(this.projectRoot, relativePath) : ''
  }

  pathInProject(filePath) {
    return this.path.relative(this.projectRoot, filePath)
  }

  async getDir(filePath) {
    return await fileOps.current.getDirectory(filePath)
  }
  async listFolder(folderPath) {
    return await fileOps.current.listFolder(folderPath)
  }

  async loadRootDirectory() {
    const rootResult = await BaseProjectManager.channel.invoke('loadTree', this.projectRoot)
    const isHasFileREADME = rootResult.children.length === 0 ? false : rootResult.children.find(item => item.name.toLowerCase() === 'readme.md')
    !isHasFileREADME && await this.createNewFile(this.projectRoot, 'README.md')
    rootResult.children = sortFile(rootResult.children)
    return rootResult
  }

  async loadDirectory(node) {
    const fileNode = await BaseProjectManager.channel.invoke('loadDirectory', node.path)
    return sortFile(fileNode)
  }

  async readProjectSettings() {
    this.projectSettings = new BaseProjectManager.ProjectSettings(this, this.settingsFilePath, BaseProjectManager.channel)
    await this.projectSettings.readSettings()
    return this.projectSettings
  }

  openProjectSettings() {
    this.project.openProjectSettings(this.settingsFilePath)
  }

  get mainFilePath() {
    if (this.projectSettings?.get('main')) {
      return this.pathForProjectFile(this.projectSettings.get('main'))
    }
    throw new Error('No main file in project settings')
  }

  async isMainValid() {
    try {
      return await fileOps.current.isFile(this.mainFilePath)
    } catch (e) {
      return false
    }
  }

  async checkSettings() {
    if (!this.project || !this.projectRoot) {
      notification.error('无项目', '请先打开一个项目')
      return
    }
    
    return await this.projectSettings.readSettings()
  }

  async isFile(filePath) {
    return await fileOps.current.isFile(filePath)
  }

  async ensureFile(filePath) {
    return await fileOps.current.fs.ensureFile(filePath)
  }

  async readFile(filePath) {
    return await fileOps.current.readFile(filePath)
  }

  async saveFile(filePath, content) {
    await fileOps.current.writeFile(filePath, content)
  }

  onFileChanged() { }

  async createNewFile(basePath, name) {
    const filePath = fileOps.current.path.join(basePath, name)
    if (await fileOps.current.isFile(filePath)) {
      throw new Error(`文件<b>${filePath}</b>已存在`)
    }

    try {
      await this.ensureFile(filePath)
    } catch (e) {
      if (e.code === 'EISDIR') {
        throw new Error(`文件夹<b>${filePath}</b>已存在`)
      } else {
        throw new Error(`创建<b>${filePath}</b>失败`)
      }
    }
    return filePath
  }

  async createNewFolder(basePath, name) {
    const folderPath = fileOps.current.path.join(basePath, name)
    if (await fileOps.current.isDirectory(folderPath)) {
      throw new Error(`文件夹<b>${folderPath}</b>已存在`)
    }

    try {
      await fileOps.current.fs.ensureDir(folderPath)
    } catch (e) {
      if (e.code === 'EISDIR') {
        throw new Error(`文件<b>${folderPath}</b>已存在`)
      } else {
        throw new Error(`创建文件夹<b>${folderPath}</b>失败`)
      }
    }
  }

  async copy(from, to) {
    const { fs } = fileOps.current
    try {
      await fs.copy(from, to, { overwrite: false, errorOnExist: true })
      return true
    } catch (error) {
      return false
    }
  }

  async checkExist (path) {
    const { fs } = fileOps.current
    return !!(await fs.promises.stat(path).catch(() => false))
  }

  async checkFileName(oldPath, newPath) {
    const { path } = fileOps.current
    const newDir = await this.getDir(newPath)
    const isFileType = await this.isFile(oldPath)
    const { name, ext } = path.parse(oldPath)

    const finalPath = isFileType ? `${newDir}/${name}${ext}` : `${newDir}/${name}`
    return {
      isExist: await this.checkExist(finalPath),
      finalPath
    }
  }

  async moveOps({ from, dest, overWrite }) {
    const { fs } = fileOps.current

    try {
      overWrite ? await fs.move(from, dest, { overwrite: true })
        : await fs.move(from, dest)
    } catch (e) {
      throw new Error(`Fail to move <b>${dest}</b>.`)
    }
  }

  async copyOps({ from, to, needMove = false }) {
    let dest
    const { path } = fileOps.current
    let toDir = await this.getDir(to)
    const fromIsFile = await this.isFile(from)
    const { name: fromName, ext: fromExt } = path.parse(from)
    const matchRule = fromIsFile ? /(?<=copy)\d*/g : /(?<=copy)\d*/g
    const hasCopyName = from.match(matchRule)
    const getCount = mathArr => +(Number(mathArr[0]) + 1)

    if (fromIsFile) {
      dest = hasCopyName
          ? from.replace(matchRule, getCount(hasCopyName))
          : needMove ? `${toDir}/${fromName}${fromExt}` : `${toDir}/${fromName} copy1${fromExt}`
    } else {
      const copiedName = toDir.replace(fromName, `${fromName} copy1`)
      dest = hasCopyName
          ? from.replace(matchRule, getCount(hasCopyName))
          : needMove ? `${toDir}/${fromName}` : copiedName
    }

    while (await fileOps.current.pathExist(dest)) {
      const matched = dest.match(matchRule)

      if (matched) {
        dest = dest.replace(matchRule, getCount(matched))
      } else {
        const copiedName = toDir.replace(fromName, `${fromName} copy1`)
        dest = fromIsFile ? `${toDir}/${fromName} copy1${fromExt}` : copiedName
      }
    }

    try {
      await this.copy(from, dest)
    } catch (e) {
      throw new Error(e)
    }
  }

  async rename(oldPath, name) {
    const { path, fs } = fileOps.current
    const { dir } = path.parse(oldPath)
    const newPath = path.join(dir, name)

    try {
      await fs.rename(oldPath, newPath)
      modelSessionManager.updateEditorAfterMovedFile(oldPath, newPath)
    } catch (e) {
      throw new Error(`Fail to rename <b>${oldPath}</b>.`)
    }
  }

  async deleteFile(node) {
    await fileOps.current.deleteFile(node.path)
  }

  onRefreshFile(data) {
    modelSessionManager.refreshFile(data)
    if (data.path === this.settingsFilePath) {
      this.projectSettings?.update(data.content)
    }
  }

  onDeleteFile(data) {
    modelSessionManager.deleteFile(data.path)
  }

  toggleTerminal(terminal) {
    BaseProjectManager.terminalButton?.setState({ terminal })
    this.project.toggleTerminal(terminal)
  }
}
