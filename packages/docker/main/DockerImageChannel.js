const { IpcChannel } = require('@obsidians/ipc')

class DockerImageChannel extends IpcChannel {
  constructor (imageName, opts = {}) {
    super('docker-image', imageName)
    this.filter = opts.filter || (() => true)
    this.sort = opts.sort
  }

  get imageName () {
    return this.uid
  }

  async versions () {
    const { logs } = await this.exec(`docker images ${this.imageName} --format "{{json . }}"`)
    let versions = logs.split('\n')
      .filter(Boolean)
      .map(JSON.parse)
      .filter(({ Tag }) => this.filter(Tag))
    if (this.sort) {
      versions = versions.sort((x, y) => this.sort(x.Tag, y.Tag))
    }
    return versions
  }

  async deleteVersion (version) {
    await this.exec(`docker rmi ${this.imageName}:${version}`)
  }

  async remoteVersions (size = 10) {
    const res = await this.fetch(`http://registry.hub.docker.com/v1/repositories/${this.imageName}/tags`)
    let versions = JSON.parse(res).filter(({ name }) => this.filter(name))
    if (this.sort) {
      versions = versions.sort((x, y) => this.sort(x.name, y.name))
    }
    return versions.slice(0, size)
  }

  async any () {
    const versions = await this.versions()
    return !!(versions && versions.length)
  }
}

module.exports = DockerImageChannel
