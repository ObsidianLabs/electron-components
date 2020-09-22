const { IpcChannel } = require('@obsidians/ipc')
const semverLt = require('semver/functions/lt')
const semverValid = require('semver/functions/valid')

const defaultFilter = v => semverValid(v)
const defaultSort = (v1, v2) => semverLt(v1, v2) ? 1 : -1

const getHandler = (opt, defaultHandler) => {
  if (typeof opt === 'boolean') {
    return opt ? defaultHandler : undefined
  }
  return opt || defaultHandler
}

class DockerImageChannel extends IpcChannel {
  constructor (imageName, opts = {}) {
    super('docker-image', imageName)
    this.filter = getHandler(opts.filter, defaultFilter)
    this.sort = getHandler(opts.sort, defaultSort)
  }

  get imageName () {
    return this.uid
  }

  async versions () {
    const { logs } = await this.exec(`docker images ${this.imageName} --format "{{json . }}"`)
    let versions = logs.split('\n')
      .filter(Boolean)
      .map(JSON.parse)
    
    if (this.filter) {
      versions = versions.filter(({ Tag }) => this.filter(Tag))
    }
    if (this.sort) {
      versions = versions.sort((x, y) => this.sort(x.Tag, y.Tag))
    }
    return versions
  }

  async deleteVersion (version) {
    await this.exec(`docker rmi ${this.imageName}:${version}`)
  }

  async remoteVersions (size = 15) {
    const res = await this.fetch(`http://registry.hub.docker.com/v1/repositories/${this.imageName}/tags`)
    let versions = JSON.parse(res)
    if (this.filter) {
      versions = versions.filter(({ name }) => this.filter(name))
    }
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
