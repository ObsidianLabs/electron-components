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

  async isDirectoryNotEmpty (dirPath) {
    if (!await this.isDirectory(dirPath)) {
      return false
    }

    const files = this.fs.readdirSync(dirPath)
    if (files && files.length) {
      return true
    }

    return false
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
}
