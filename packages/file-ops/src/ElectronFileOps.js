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
    return this.electron.shell.openPath(filePath)
  }

  showItemInFolder (filePath) {
    return this.electron.shell.showItemInFolder(filePath)
  }

  getAppVersion () {
    return this.electron.remote.app.getVersion()
  }

  openLink (href) {
    return this.electron.shell.openExternal(href)
  }

  openInTerminal (filePath) {
    const os = window.require('os')
    const channel = new IpcChannel()
    if (os.type() === 'Darwin') {
      channel.invoke('exec', `open -a Terminal "${filePath}"`)
    } else if (os.type() === 'Windows_NT') {
      channel.invoke('exec', `invoke-expression 'cmd /c start powershell -NoExit -Command { Set-Location "${filePath}" }'`)
    } else {
      channel.invoke('exec', `gnome-terminal --working-directory=${filePath}`)
    }
  }

  deleteFile (filePath) {
    return this.trash([filePath])
  }
}