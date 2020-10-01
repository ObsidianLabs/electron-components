import ipcRenderer from './ipcRenderer' 

export default class IpcChannel {
  constructor(channel = 'default', uid = '') {
    this.channel = channel
    this.uid = uid
    this.listeners = {}
    this.onDataReceived = this.onDataReceived.bind(this)
    ipcRenderer.on(this.channelResponse, this.onDataReceived)
  }

  get channelName() {
    return `obsidians-ipc-${this.channel}-${this.uid}`
  }

  get channelResponse() {
    return `obsidians-ipc-response-${this.channel}-${this.uid}`
  }

  dispose () {
    this.listeners = {}
    ipcRenderer.removeListener(this.channelResponse, this.onDataReceived)
  }

  on (method, callback) {
    if (!this.listeners[method]) {
      this.listeners[method] = []
    }
    this.listeners[method].push(callback)

    return () => this.off(method, callback)
  }

  off (method, callback) {
    if (!this.listeners[method]) {
      return
    }
    if (!callback) {
      this.listeners[method] = []
      return
    }
    let cbs = this.listeners[method]
    for (let i = 0; i < cbs.length; i++) {
      if (cbs[i] === callback) {
        cbs.splice(i, 1)
        return
      }
    }
  }

  onDataReceived (event, method, ...args) {
    if (!this.listeners[method]) {
      return
    }
    this.listeners[method].forEach(cb => cb(...args))
  }

  invoke (method, ...args) {
    return ipcRenderer.invoke(this.channelName, method, args)
  }
}