let ipcRenderer
if (window.require) {
  ipcRenderer = window.require('electron').ipcRenderer
} else {
  ipcRenderer = {
    invoke: (channel, method, ...args) => {
      if (channel.startsWith('obsidians-ipc-docker')) {
        switch (method) {
          case 'check':
            return true
          case 'any':
            return true
          case 'version':
            return true
          case 'versions':
          case 'remoteVersions':
            return []
        }
      } else if (channel.startsWith('obsidians-ipc-auto-update')) {
        switch (method) {
          case 'check':
            return
        }
      } else if (channel.startsWith('obsidians-ipc-ckb-keypair')) {
        switch (method) {
          case 'allKeypairAddresses':
            return []
        }
      } else if (channel.startsWith('obsidians-ipc-terminal')) {
        return
      }

      if (method === 'list') {
        return []
      }

      console.log(channel, method, args)
    },
    on: (channel, callback) => {},
    removeListener: (channel, callback) => {},
  }
}

export default ipcRenderer