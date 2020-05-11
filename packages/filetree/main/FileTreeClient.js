const fs = require('fs')
const path = require('path')
const FileHound = require('filehound')
const debounce = require('lodash/debounce')

class FileTreeClient {
  constructor (rootDir, channel) {
    const { dir, base } = path.parse(rootDir)
    this.rootDir = path.join(dir, base)
    this.channel = channel

    this.tree = {
      name: base,
      root: true,
      toggled: true,
      path: this.rootDir,
      loading: true,
      children: []
    }
    this.treePointer = {
      [this.rootDir]: this.tree
    }
    this.watchers = {}

    this.debouncedRefresh = debounce(async (directory, callback) => {
      await this.refreshDirectory(directory)
      callback()
    }, 200)

    this.debouncedRefreshPromise = directory => new Promise(resolve => {
      this.debouncedRefresh(directory, resolve)
    })
  }

  dispose () {
    Object.keys(this.watchers).forEach(watchingPath => {
      if (this.watchers[watchingPath]) {
        this.watchers[watchingPath].close()
      }
      this.watchers[watchingPath] = undefined
    })
  }

  async ready () {
    await this.loadDirectory(this.rootDir)
  }

  async loadDirectory (directory) {
    if (!this.treePointer[directory]) {
      return
    }

    await this.refreshDirectory(directory)

    if (this.treePointer[directory]) {
      this.treePointer[directory].toggled = true
    }

    if (!this.watchers[directory]) {
      this.watchers[directory] = fs.watch(directory, async () => {
        await this.debouncedRefreshPromise(directory)
        this.channel.send('refresh-directory', this.treePointer[directory])
      })
    }
  }

  closeDirectory (directory) {
    if (this.treePointer[directory]) {
      this.treePointer[directory].toggled = false
    }

    if (this.watchers[directory]) {
      this.watchers[directory].close()
    }
    this.watchers[directory] = undefined
  }

  async refreshDirectory (directory) {
    if (this.treePointer[directory].children) {
      this.treePointer[directory].children = []
    }

    await FileHound
      .create()
      .paths(directory)
    // .ignoreHiddenDirectories()
    // .ignoreHiddenFiles()
      .directory()
      .not()
      .glob('node_modules', '.git')
      .depth(1)
      .find()
      .then(dirs => {
        dirs.forEach(dirPath => {
          const { dir, base } = path.parse(dirPath)
          this.treePointer[dirPath] = this.treePointer[dirPath] || {
            name: base,
            path: dirPath,
            toggled: false,
            loading: true,
            children: []
          }
          this.treePointer[dir].children.push(this.treePointer[dirPath])
        })
      })

    await FileHound
      .create()
      .paths(directory)
    // .ignoreHiddenDirectories()
      .ignoreHiddenFiles()
      .depth(0)
      .find()
      .then(files => {
        files.forEach(filePath => {
          const { dir, base } = path.parse(filePath)
          this.treePointer[dir].children.push({
            name: base,
            path: filePath
          })
        })
      })

    this.treePointer[directory].loading = false
  }
}

module.exports = FileTreeClient