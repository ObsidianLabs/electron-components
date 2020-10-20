export default 'The default export is not available'

let TempIpcChannel

if (window.require) {
  TempIpcChannel = require('./ElectronIpcChannel').default
} else {
  TempIpcChannel = require('./HttpIpcChannel').default
}

export const IpcChannel = TempIpcChannel