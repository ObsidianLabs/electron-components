import redux from '@obsidians/redux'
import decode from 'jwt-decode'
import providers from './providers'

export default {
  profile: null,
  credentials: null,
  refreshPromise: null,
  provider: null,
  history: null,

  get username () {
    return this.profile && this.profile.username
  },

  get isLogin () {
    return !!this.username
  },

  get shouldRefresh () {
    if (!this.isLogin) {
      return false
    }
    if (!this.credentials || !this.credentials.token) {
      return true
    }
    return this.provider.shouldRefresh(this.credentials.token)
  },

  async login (history, provider = 'github') {
    this.history = history
    this.provider = providers[provider]
    if (!this.provider) {
      this.redirect()
      return
    }

    const code = await this.provider.request()
    if (!code) {
      return
    }

    await this.grant(code)

    await this.provider.done()
  },

  async callback ({ location, history }) {
    const query = new URLSearchParams(location.search);
    const code = query.get('code')
    const provider = query.get('provider')

    this.history = history
    this.provider = providers[provider]
    if (!this.provider) {
      this.redirect()
      return
    }

    await this.grant(code)

    this.redirect()
  },

  async logout (history) {
    this.profile = null
    this.credentials = null
    this.refreshPromise = null
    redux.dispatch('CLEAR_USER_PROFILE')

    await this.provider.logout()

    this.provider = null

    this.history = history
    this.redirect()
  },

  async getToken () {
    if (!this.refreshPromise) {
      this.refreshPromise = this.refresh()
    }
    await this.refreshPromise
    this.refreshPromise = null
    return this.credentials && this.credentials.token
  },

  async grant (code) {
    if (!this.provider) {
      return
    }
    const credentials = await this.provider.grant(code)
    if (!credentials) {
      return
    }

    this.credentials = credentials
    this.profile = decode(credentials.token)

    this.update()
  },

  // Update profile to redux, update credentials to provder
  async update () {
    if (!redux.store) {
      await new Promise(resolve => setTimeout(resolve, 500))
      await this.update()
    } else if (this.profile) {
      redux.dispatch('UPDATE_PROFILE', this.profile)
    }
    if (this.credentials && this.provider) {
      this.provider.update(this.credentials)
    }
  },

  // Restore profile from redux
  restore () {
    if (!this.profile) {
      try {
        const profile = redux.getState().profile
        this.profile = profile.toJS()
        this.provider = providers[this.profile.provider]
      } catch (error) {
        this.profile = null
        this.provider = null
        console.warn('Restore failed', error)
      }
    }
  },

  async refresh () {
    if (this.shouldRefresh) {
      this.restore()
      await this.grant()
    }
  },

  redirect(path = '/') {
    if (this.history) {
      this.history.replace(path)
    }
  }
}
