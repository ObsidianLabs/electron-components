import platform from '@obsidians/platform'

let TempIpcChannel

if (platform.isDesktop) {
  TempIpcChannel = require('./ElectronIpcChannel').default
} else {
  TempIpcChannel = require('./HttpIpcChannel').default
}

export const IpcChannel = TempIpcChannel