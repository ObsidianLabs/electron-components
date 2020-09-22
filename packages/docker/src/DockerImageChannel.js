import { IpcChannel } from '@obsidians/ipc'

export default class DockerImageChannel extends IpcChannel {
  constructor(imageName) {
    super('docker-image', imageName)
    this.eventTarget = new EventTarget()
  }

  get imageName () {
    return this.uid
  }

  async installed () {
    return await this.invoke('any')
  }

  async versions () {
    const versions = await this.invoke('versions')
    const event = new CustomEvent('versions', { detail: versions })
    this.eventTarget.dispatchEvent(event)
    return versions
  }

  onVersionsRefreshed (callback) {
    const eventHandler = event => callback(event.detail)
    this.eventTarget.addEventListener('versions', eventHandler)
  }

  async remoteVersions (size) {
    return await this.invoke('remoteVersions', size)
  }

  async delete (version) {
    return await this.invoke('deleteVersion', version)
  }
}