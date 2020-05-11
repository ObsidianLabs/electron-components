const { app, BrowserWindow } = require('electron')
const { ipc } = require('@obsidians/ipc')
const { TerminalChannelManager } = require('@obsidians/terminal')

let channelManager
function createWindow () {
  let win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })

  ipc.window = win
  channelManager = new TerminalChannelManager()

  win.loadURL('http://localhost:3000')
}

app.on('ready', createWindow)