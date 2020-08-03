import { IpcChannel } from '@obsidians/ipc'

export default class DockerImageChannel extends IpcChannel {
  constructor(imageName) {
    super('docker-image', imageName)
  }

  get imageName () {
    return this.uid
  }

  async installed () {
    return await this.invoke('any')
  }

  async versions () {
    return await this.invoke('versions')
  }

  async remoteVersions (size = 10) {
    return await this.invoke('remoteVersions', size)
  }

  async delete (version) {
    return await this.invoke('deleteVersion', version)
  }
}