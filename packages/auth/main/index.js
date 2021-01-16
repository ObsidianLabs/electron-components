const { IpcChannel } = require('@obsidians/ipc')
const { BrowserWindow } = require('electron')
const path = require('path')
const isDev = require('electron-is-dev')

class AuthManager extends IpcChannel {
  constructor() {
    super('auth')
    this.win = null
  }
  
  async login({ loginUrl, serverUrl }) {
    return new Promise((resolve) => {
      this.createWindow(resolve)
      this.win.loadURL(loginUrl)

      const { session: { webRequest } } = this.win.webContents
      const filter = {
        urls: [`${serverUrl}/api/v1/auth*`]
      }

      webRequest.onBeforeRequest(filter, ({ url }, callback) => {
        const redirectURL = isDev ? 'http://localhost:3000/loading.html' : `file://${path.join(__dirname, '../loading.html')}`
        if (url.startsWith(`${serverUrl}/api/v1/auth/callback?error`)) {
          callback({ cancel: true })
          resolve()
          this.loading()
        } else if (url.startsWith(`${serverUrl}/api/v1/auth/callback`)) {
          callback({ cancel: true })
          resolve(url)
          this.loading()
        } else {
          callback({ cancel: false })
        }
      })
    })
  }

  createWindow(resolve) {
    this.win = new BrowserWindow({
      width: 420,
      height: 605,
      alwaysOnTop: true,
      resizable: false,
      backgroundColor: '#2F2F32',
    })

    this.win.on('closed', () => {
      this.win = null
      resolve()
    })
  }

  async close() {
    if (this.win) {
      this.win.close()
    }
  }

  async loading() {
    this.win.loadURL(redirectURL)
  }
}

module.exports = AuthManager
