import path from 'path-browserify'
import FileOps from './FileOps'
import AwsS3Fs from './AwsS3Fs'

export default class WebFileOps extends FileOps {
  constructor () {
    const fs = new AwsS3Fs()
    super(fs, path)

    this.electron = {}

    this.homePath = '/'
    this.workspace = path.join(this.homePath, process.env.PROJECT_NAME)
  }

  onFocus (handler) {
    // this.electron.ipcRenderer.on('on-focus', handler)
  }

  offFocus (handler) {
    // this.electron.ipcRenderer.on('off-focus', handler)
  }

  async openNewFile (defaultPath = this.workspace) {
    const result = await this.electron.remote.dialog.showOpenDialog({
      properties: ['openFile'],
      defaultPath: this.path.isAbsolute(defaultPath) ? defaultPath : this.path.join(this.workspace, defaultPath),
      filters: [
        // { name: 'all', extensions: ['cpp', 'hpp', 'wasm', 'abi', 'md', 'js', 'json', 'c', 'h', 'o'] }
      ]
    })
  
    if (result && result.filePaths && result.filePaths[0]) {
      const filePath = result.filePaths[0]
      return { key: filePath, path: filePath }
    } else {
      throw new Error()
    }
  }

  async chooseFolder (defaultPath = this.workspace) {
    const result = await this.electron.remote.dialog.showOpenDialog({
      buttonLabel: 'Open',
      defaultPath: this.path.isAbsolute(defaultPath) ? defaultPath : this.path.join(this.workspace, defaultPath),
      properties: ['openDirectory', 'createDirectory']
    })

    if (result && result.filePaths && result.filePaths[0]) {
      const filePath = result.filePaths[0]
      return filePath
    } else {
      throw new Error()
    }
  }

  showMessageBox ({ message, buttons }) {
    const result = window.confirm(message)
    return { response: result ? 0 : 1 }
  }

  openItem (filePath) {
    return this.electron.shell.openItem(filePath)
  }

  showItemInFolder (filePath) {
    return this.electron.shell.showItemInFolder(filePath)
  }

  async createNewFolder (folderPath) {
    try {
      await this.fs.ensureDir(folderPath)
    } catch (e) {
      throw new Error(`Fail to create the folder <b>${folderPath}</b>.`)
    }
  }

  getAppVersion () {
    return process.env.APP_VERSION
  }

  openLink (href) {
    return this.electron.shell.openExternal(href)
  }

  openInTerminal (filePath) {
  }

  deleteFile (filePath) {
    return this.fs.deleteFile(filePath)
  }
}