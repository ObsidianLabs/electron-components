import path from 'path-browserify'
import FileOps from './FileOps'
import RemoteFs from './RemoteFs'

export default class WebFileOps extends FileOps {
  constructor () {
    const fs = new RemoteFs()
    super(fs, path)

    this.electron = {}
    this.trash = {}

    this.homePath = '/'
    this.workspace = path.join(this.homePath, process.env.PROJECT_NAME)
    // this.ensureDirectory(this.workspace)
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

  openItem (filePath) {
    return this.electron.shell.openItem(filePath)
  }

  showItemInFolder (filePath) {
    return this.electron.shell.showItemInFolder(filePath)
  }

  getAppVersion () {
    return process.env.APP_VERSION
  }

  openLink (href) {
    return this.electron.shell.openExternal(href)
  }

  openInTerminal (filePath) {
    return this.exec(`open -a Terminal "${filePath}"`)
    // exec(`start cmd @cmd /k pushd "${node.path}"`)
  }

  trash (files) {
    return this.trash(files)
  }
}