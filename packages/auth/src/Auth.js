import redux from '@obsidians/redux'
import decode from 'jwt-decode'

import providers from './providers'

const authServerUrl = process.env.REACT_APP_AUTH_SERVER

export default {
  profile: null,

  login (provider = 'github') {
    if (!providers[provider]) {
      return
    }
    providers[provider].login()
  },

  logout (history) {
    this.profile = {}
    redux.dispatch('CLEAR_USER_PROFILE')
    history.replace('/')
  },

  async handleCallback ({ location, history }) {
    const query = new URLSearchParams(location.search);
    const code = query.get('code')
    const provider = query.get('provider')

    let token
    try {
      const response = await fetch(`${authServerUrl}/api/v1/auth/login`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({ code, provider })
      });
      const result = await response.json()
      token = result.token
    } catch (err) {
      history.replace('/')
      return
    }

    if (!token) {
      history.replace('/')
      return
    }

    const { username, avatar } = decode(token)
    this.profile = { token, username, avatar }
    history.replace('/')
  },

  updateProfile () {
    if (this.profile) {
      redux.dispatch('UPDATE_PROFILE', this.profile)
    } else {
      const profile = redux.getState().profile
      this.profile = profile.toJS()
    }
  },
}
