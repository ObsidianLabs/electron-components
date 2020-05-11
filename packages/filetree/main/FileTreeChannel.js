const { IpcChannel } = require('@obsidians/ipc')

const FileTreeClient = require('./FileTreeClient')

class FileTreeChannel extends IpcChannel {
  constructor() {
    super('file-tree')
    this.fileTreeClient = null
  }

  async loadTree (projectRoot) {
    if (this.fileTreeClient) {
      this.fileTreeClient.dispose()
    }

    this.fileTreeClient = new FileTreeClient(projectRoot, this)
    await this.fileTreeClient.ready()
    return this.fileTreeClient.tree
  }

  async loadDirectory (directory) {
    await this.fileTreeClient.loadDirectory(directory)
    return this.fileTreeClient.treePointer[directory].children
  }

  async toggleDirectory (directory, toggled) {
    this.fileTreeClient.treePointer[directory].toggled = toggled
    if (toggled) {
      await this.fileTreeClient.loadDirectory(directory)
      this.send('refresh-directory', this.fileTreeClient.treePointer[directory])
    } else {
      this.fileTreeClient.closeDirectory(directory)
    }
  }
}

module.exports = FileTreeChannel
