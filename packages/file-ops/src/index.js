import ElectronFileOps from './ElectronFileOps'

class FileOpsManager {
  constructor () {
    this._fsType = null
    this._fileOps
  }

  set fsType (fsType) {
    this._fsType = fsType
    if (fsType === 'electron') {
      this._fileOps = new ElectronFileOps()
      return
    }
    throw new Error(`Unknown fsType "${this.fsType}".`)
  }

  get current () {
    if (!this._fsType) {
      throw new Error('this.fsType is not defined.')
    }
    if (!this._fileOps) {
      throw new Error(`Unknown fsType "${this.fsType}".`)
    }
    return this._fileOps
  }
}

export default new FileOpsManager()
