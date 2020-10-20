export default class HttpClient {
  constructor (generalUrl, specificUrl) {
    this.generalUrl = generalUrl
    this.specificUrl = specificUrl
  }

  async invoke (channel, method, ...args) {
    if (channel.startsWith('docker')) {
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
    } else if (channel.startsWith('auto-update')) {
      switch (method) {
        case 'check':
          return
      }
    } else if (channel.startsWith('terminal')) {
      return
    } else if (channel.endsWith('-project')) {
      if (method === 'loadTree') {
        return {}
      }
    }

    if (method === 'list') {
      return []
    }

    if (method === 'get') {
      const endpoint = args[0] ? `${channel}/${args[0]}` : channel
      return this.query(`${this.generalUrl}/${endpoint}`, 'GET', args[1])
    }

    return this.query(`${this.specificUrl}/${channel}`, 'POST', { method, args })
  }

  async query (endpoint, method, params) {
    const opts = {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method,
    }
    if (method === 'POST') {
      opts.body = JSON.stringify(params)
    }

    const response = await fetch(endpoint, opts)
    let result = await response.text()

    try {
      result = JSON.parse(result)
    } catch (e) {}

    if (response.status >= 400) {
      throw new Error(result.message || result)
    }
    return result
  }

  on (channel, callback) {}
  removeListener (channel, callback) {}
}