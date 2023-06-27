import redux from '@obsidians/redux'
import providers from './providers'

export default {
  profile: null,
  credentials: null,
  suspendPromise: false,
  modal: null,
  provider: null,
  history: null,

  get username() {
    return this.profile && this.profile.username
  },

  get isLogin() {
    return !!this.username
  },

  async login(history, provider) {
    try {
      this.history = history
      this.provider = providers[provider] || this.provider
      if (!this.provider) {
        this.redirect()
        return
      }
  
      const code = await this.provider.request()
      if (!code) {
        return
      }
  
      await this.grant(code)
  
      await this.provider.done(history)
    } catch (error) {
      throw new Error(error)
    }
  },

  async callback({ location, history, provider: providerName }) {
    const query = new URLSearchParams(location.search)
    const code = query.get('code')
    const state = query.get('state')
    const envProviders = process.env.LOGIN_PROVIDERS ? process.env.LOGIN_PROVIDERS.split(',') : []
    const provider = query.get('provider') || providerName || (envProviders.length && envProviders[0])

    this.history = history
    this.provider = providers[provider] || this.provider
    if (!this.provider) {
      this.redirect()
      return
    }

    await this.grant(code)

    const { path } = this.provider.handleState(state, this.profile)
    this.redirect(path)
  },

  async logout(history) {
    this.profile = null
    this.credentials = null
    this.suspendPromise = null
    redux.dispatch('CLEAR_USER_PROFILE')

    if (this.provider) {
      await this.provider.logout()
    }

    this.provider = null

    this.history = history
    this.redirect()
  },

  needRefresh() {
    if (!this.isLogin) return false
    if (!this.credentials) return true
    return this.provider.shouldRefresh(this.credentials.token)
  },

  async refreshCheck() {
    if (this.needRefresh()) {
      this.restore()
      await this.grant()
    }
  },

  async getToken() {
    if (!this.suspendPromise) {
      this.suspendPromise = this.refreshCheck()
    }
    await this.suspendPromise
    this.suspendPromise = null
    return this.credentials && this.credentials.token
  },

  async grant(code) {
    if (!this.provider) return
    const { credentials, profile } = await this.provider.grant(code)
    if (!credentials) return

    this.credentials = credentials
    this.profile = profile
    this.update()
  },

  async getNoUserAuth () {
    this.credentials = await this.provider.getNoUserAuth()
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
    if (providers[this.profile.provider]) {
      providers[this.profile.provider].restore(this.profile)
    }
  },

  async refresh () {
    if (this.shouldRefresh) {
      this.restore()
      const code = await this.provider.request()
      if (!code) {
        return
      }
  
      await this.grant(code, this.history)
    }
    // TODO: should invoke it when direct to the project page
    if (!this.provider){ 
      this.provider = providers['nouser']
      await this.getNoUserAuth()
    }
  },

  redirect(path = '/') {
    if (this.history) {
      this.history.replace(path)
    }
  },

  handleError({ status }) {
    if (!this.provider) {
      return
    }
    this.provider.handleError({ status, modal: this.modal })
  }
}
