import { IpcChannel } from '@obsidians/ipc'

class FileTreeChannel extends IpcChannel {
  constructor () {
    super('file-tree')
  }
}

export default new FileTreeChannel()
