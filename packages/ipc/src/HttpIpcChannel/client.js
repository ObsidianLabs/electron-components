const serverUrl = process.env.REACT_APP_IPC_SERVER_URL

export default {
  invoke: async (channel, method, ...args) => {
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
    } else if (channel.startsWith('obsidians-ipc-terminal')) {
      return
    }

    if (method === 'list') {
      return []
    }

    const endpoint = channel.replace('obsidians-ipc-', '')
    const response = await fetch(`${serverUrl}/api/v1/${endpoint}`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({ method, args })
    })
    let result = await response.text()

    try {
      result = JSON.parse(result)
    } catch (e) {}

    if (response.status >= 400) {
      throw new Error(result.message || result)
    }
    return result
  },
  on: (channel, callback) => {},
  removeListener: (channel, callback) => {},
}