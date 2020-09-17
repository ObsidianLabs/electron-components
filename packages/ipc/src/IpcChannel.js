import ipcRenderer from './ipcRenderer' 

export default class IpcChannel {
  constructor(channel = 'default', uid = '') {
    this.channel = channel
    this.uid = uid
    this.callback = undefined
    this.onDataReceived = this.onDataReceived.bind(this)
  }

  get channelName() {
    return `obsidians-ipc-${this.channel}-${this.uid}`
  }

  get channelResponse() {
    return `obsidians-ipc-response-${this.channel}-${this.uid}`
  }

  dispose () {
    this.callback = undefined
    ipcRenderer.removeListener(this.channelResponse, this.onDataReceived)
  }

  onData (callback) {
    this.callback = callback
    ipcRenderer.on(this.channelResponse, this.onDataReceived)
  }

  onDataReceived (event, method, ...args) {
    if (this.callback) {
      this.callback(method, args)
    }
  }

  invoke (method, ...args) {
    return ipcRenderer.invoke(this.channelName, method, args)
  }
}