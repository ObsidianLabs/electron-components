import ipcRenderer from './ipcRenderer' 

export default class IpcChannel {
  constructor(channel = 'default', uid = '') {
    this.channel = channel
    this.uid = uid
    this.listeners = {}
    this._onDataReceived = this._onDataReceived.bind(this)
    ipcRenderer.on(this.channelResponse, this._onDataReceived)
  }

  get channelName() {
    return `obsidians-ipc-${this.channel}-${this.uid}`
  }

  get channelResponse() {
    return `obsidians-ipc-response-${this.channel}-${this.uid}`
  }

  dispose () {
    this.listeners = {}
    ipcRenderer.removeListener(this.channelResponse, this._onDataReceived)
  }

  invoke (method, ...args) {
    return ipcRenderer.invoke(this.channelName, method, args)
  }

  on (event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event].push(callback)

    return () => this.off(event, callback)
  }

  off (event, callback) {
    if (!this.listeners[event]) {
      return
    }
    if (!callback) {
      this.listeners[event] = []
      return
    }
    let cbs = this.listeners[event]
    for (let i = 0; i < cbs.length; i++) {
      if (cbs[i] === callback) {
        cbs.splice(i, 1)
        return
      }
    }
  }

  get events () {
    return Object.keys(this.listeners)
  }

  trigger (event, ...args) {
    if (!this.listeners[event]) {
      return
    }
    this.listeners[event].forEach(cb => cb(...args))
  }

  _onDataReceived (_, method, ...args) {
    this.trigger(method, ...args)
  }
}