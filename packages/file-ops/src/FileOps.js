export default class FileOps {
  constructor (fs, path) {
    this.fs = fs
    this.path = path
  }

  async isDirectory (dirPath) {
    try {
      return (await this.fs.promises.stat(dirPath)).isDirectory()
    } catch (e) {
      return false
    }
  }

  async isFile (filePath) {
    try {
      return (await this.fs.promises.stat(filePath)).isFile()
    } catch (e) {
      return false
    }
  }

  async ensureDirectory (dirPath) {
    try {
      await this.fs.ensureDir(dirPath)
      return true
    } catch (e) {
      console.warn(e)
      return false
    }
  }

  async ensureFile (filePath) {
    try {
      await this.fs.ensureFile(filePath)
      return true
    } catch (e) {
      console.warn(e)
      return false
    }
  }

  async readFile (filePath, encoding = 'utf8') {
    return this.fs.promises.readFile(filePath, { encoding })
  }

  async writeFile (filePath, content) {
    return this.fs.promises.writeFile(filePath, content)
  }

  async createNewFile (filePath) {
    if (await this.isFile(filePath)) {
      throw new Error(`File <b>${filePath}</b> already exists.`)
    }
  
    try {
      await this.fs.ensureFile(filePath)
    } catch (e) {
      if (e.code === 'EISDIR') {
        throw new Error(`Folder <b>${filePath}</b> already exists.`)
      } else {
        throw new Error(`Fail to create the file <b>${filePath}</b>.`)
      }
    }
  }

  getDockerMountPath (mountPath) {
    if (process.env.OS_IS_WINDOWS) {
      const { root } = this.path.parse(mountPath)
      const pathRoot = root.split(':')[0].toLowerCase()
      const pathWithoutRoot = mountPath.split(':').pop().split('\\').join('/')
      return `/${pathRoot}${pathWithoutRoot}`
    }
    return mountPath
  }
}
