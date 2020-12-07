const fs = require('fs')
const path = require('path')
const chokidar = require('chokidar')
const throttle = require('lodash/throttle')

const throttleByKey = (func, wait) => {
  const cache = new Map()
  return (...args) => {
    if (!cache.has(args[0])) {
      cache.set(args[0], throttle(func, wait))
    }
    return cache.get(args[0])(...args)
  }
}

class FileTreeWatcher {
  constructor (rootDir, client) {
    this.watcher = this.watchDirectory(rootDir)
    this.client = client

    this.throttledRefreshDirectory = throttleByKey(dir => client.loadAndRefreshDirectory(dir), 200)
    this.throttledFileModified = throttleByKey(filePath => this.refreshFile(filePath), 200)
  }

  dispose () {
    this.watcher.close()
  }

  watchDirectory (rootDir) {
    const watcher = chokidar.watch(rootDir, {
      ignoreInitial: true
    })
    watcher
      .on('add', path => this.onFileCreated({ path }))
      .on('change', path => this.onFileModified({ path }))
      .on('unlink', path => this.onFileMoved({ path }))
      .on('addDir', path => this.onDirectoryCreated({ path }))
      .on('unlinkDir', path => this.onDirectoryMoved({ path }))

    return watcher
  }

  onFileCreated (details) {
    const { dir } = path.parse(details.path)
    this.throttledRefreshDirectory(dir)
  }

  onFileModified (details) {
    this.throttledFileModified(details.path)
  }

  onFileMoved (details) {
    const { dir } = path.parse(details.path)
    this.throttledRefreshDirectory(dir)
  }

  onDirectoryCreated (details) {
    const { dir } = path.parse(details.path)
    this.throttledRefreshDirectory(dir)
  }

  onDirectoryMoved (details) {
    const { dir } = path.parse(details.path)
    this.throttledRefreshDirectory(dir)
  }

  async refreshFile (filePath) {
    const content = await fs.promises.readFile(filePath, 'utf8')
    this.client.channel.send('refresh-file', { path: filePath, content })
  }
}

module.exports = FileTreeWatcher
