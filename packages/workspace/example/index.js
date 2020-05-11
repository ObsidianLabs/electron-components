const { app, BrowserWindow } = require('electron')
const { ipc } = require('@obsidians/ipc')
const { FileTreeChannel } = require('@obsidians/filetree')

let filetreeChannel
function createWindow () {
  let win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })

  ipc.window = win
  filetreeChannel = new FileTreeChannel()

  win.loadURL('http://localhost:3000')
}

app.on('ready', createWindow)