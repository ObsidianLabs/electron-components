import Auth from '@obsidians/auth'

const PROJECT = process.env.PROJECT

export default class HttpClient {
  constructor (serverUrl, specificUrl) {
    this.serverUrl = serverUrl
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
    } else if (channel === 'user') {
      return this.query(`${this.serverUrl}/user/${method}`, 'GET')
    }

    if (method === 'list') {
      return []
    }

    if (method === 'get') {
      const endpoint = args[0] ? `${channel}/${args[0]}` : channel
      return this.query(`${this.serverUrl}/${PROJECT}/${endpoint}`, 'GET')
    } else if (method === 'post') {
      const endpoint = args[0] ? `${channel}/${args[0]}` : channel
      return this.query(`${this.serverUrl}/${PROJECT}/${endpoint}`, 'POST', args[1])
    } else if (method === 'delete') {
      const endpoint = args[0] ? `${channel}/${args[0]}` : channel
      return this.query(`${this.serverUrl}/${PROJECT}/${endpoint}`, 'DELETE')
    }

    return this.query(`${this.specificUrl}/${channel}`, 'POST', { method, args })
  }

  async query (endpoint, method, params) {

    const token = await Auth.getToken()
    if (!token) {
      throw new Error('Not authorized')
    }
    const opts = {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      method,
    }
    if (method === 'POST') {
      opts.body = JSON.stringify(params)
    }

    const response = await fetch(endpoint, opts)
    if (response.status === 401) {
      throw new Error('Not authorized')
    }

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