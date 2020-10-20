import { IpcChannel } from '@obsidians/ipc'

import FileOps from './FileOps'

export default class ElectronFileOps extends FileOps {
  constructor () {
    const fs = window.require('fs-extra')
    const path = window.require('path')
    super(fs, path)

    this.electron = window.require('electron')
    this.trash = window.require('trash')

    this.homePath = this.electron.remote.app.getPath('home')
    this.workspace = path.join(this.homePath, process.env.PROJECT_NAME)
    this.ensureDirectory(this.workspace)
  }

  onFocus (handler) {
    this.electron.ipcRenderer.on('on-focus', handler)
  }

  offFocus (handler) {
    this.electron.ipcRenderer.on('off-focus', handler)
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

  showOpenDialog (options) {
    return this.electron.remote.dialog.showOpenDialog(this.electron.remote.getCurrentWindow(), options)
  }

  showMessageBox ({ message, buttons }) {
    return this.electron.remote.dialog.showMessageBox({ message, buttons })
  }

  openItem (filePath) {
    return this.electron.shell.openItem(filePath)
  }

  showItemInFolder (filePath) {
    return this.electron.shell.showItemInFolder(filePath)
  }

  async createNewFolder (folderPath) {
    if (await this.isDirectory(folderPath)) {
      throw new Error(`Folder <b>${folderPath}</b> already exists.`)
    }
  
    try {
      await this.fs.ensureDir(folderPath)
    } catch (e) {
      if (e.code === 'EISDIR') {
        throw new Error(`File <b>${folderPath}</b> already exists.`)
      } else {
        throw new Error(`Fail to create the folder <b>${folderPath}</b>.`)
      }
    }
  }

  getAppVersion () {
    return this.electron.remote.app.getVersion()
  }

  openLink (href) {
    return this.electron.shell.openExternal(href)
  }

  openInTerminal (filePath) {
    const channel = new IpcChannel()
    channel.invoke('exec', `open -a Terminal "${filePath}"`)
  }

  deleteFile (filePath) {
    return this.trash([filePath])
  }
}