import redux from '@obsidians/redux'
import decode from 'jwt-decode'
import AWS from 'aws-sdk'

import fileOps from '@obsidians/file-ops'
import { BuildService } from '@obsidians/ipc'

import providers from './providers'
import { AWSRoleArn, AWSRoleSessionName, AWSRegion } from '../config.json'

const serverUrl = process.env.REACT_APP_SERVER_URL
const awsRoleArn = process.env.REACT_APP_AWS_ROLE_ARN || AWSRoleArn
const awsRoleSessionName = process.env.REACT_APP_AWS_ROLE_SESSION_NAME || AWSRoleSessionName
const awsRegion = process.env.REACT_APP_AWS_REGION || AWSRegion

export default {
  profile: null,
  credentials: null,
  refreshPromise: null,

  get username () {
    return this.profile && this.profile.username
  },

  get isLogin () {
    return !!this.username
  },

  login (provider = 'github') {
    if (!providers[provider]) {
      return
    }
    providers[provider].login()
  },

  async logout (history) {
    this.profile = {}
    this.credentials = {}
    this.refreshPromise = null
    redux.dispatch('CLEAR_USER_PROFILE')

    try {
      await fetch(`${serverUrl}/api/v1/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {}

    history.replace('/')
  },

  async handleCallback ({ location, history }) {
    const query = new URLSearchParams(location.search);
    const code = query.get('code')
    const provider = query.get('provider')

    const tokens = await this.fetchTokens(code, provider)
    if (!tokens) {
      history.replace('/')
      return
    }

    const { token, awsToken } = tokens

    const awsCredential = await this.fetchAwsCredential(awsToken)
    if (!awsCredential) {
      history.replace('/')
      return
    }

    const { username, avatar } = decode(token)
    this.profile = { username, avatar }
    this.credentials = { token, awsCredential }
    history.replace('/')
  },

  async refresh() {
    if (!this.shouldRefresh()) {
      return
    }

    const tokens = await this.fetchTokens()
    if (!tokens) {
      return
    }

    const { token, awsToken } = tokens

    const awsCredential = await this.fetchAwsCredential(awsToken)
    if (!awsCredential) {
      return
    }

    const { username, avatar } = decode(token)
    this.profile = { username, avatar }
    this.credentials = { token, awsCredential }
    this.updateProfile()
  },

  async fetchTokens (code, provider) {
    try {
      let url
      let method
      let body
      if (code && provider) {
        url = `${serverUrl}/api/v1/auth/login`
        method = 'POST'
        body = JSON.stringify({ code, provider })
      } else {
        url = `${serverUrl}/api/v1/auth/refresh-token`
        method = 'GET'
      }

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        method,
        body,
      });

      const { token, awsToken } = await response.json()
      return { token, awsToken }
    } catch (error) {
      return
    }
  },

  async fetchAwsCredential(awsToken) {
    AWS.config.update({
      region: awsRegion,
    })
    const sts = new AWS.STS()
    const params = {
      WebIdentityToken: awsToken,
      RoleArn: awsRoleArn,
      RoleSessionName: awsRoleSessionName,
      DurationSeconds: 3600,
    }
    try {
      const awsCredential = await new Promise((resolve, reject) => {
        sts.assumeRoleWithWebIdentity(params, (err, data) => err ? reject(err) : resolve(data))
      })
      return awsCredential
    } catch (error) {
      return
    }
  },

  async getToken () {
    if (!this.refreshPromise) {
      this.refreshPromise = this.refresh()
    }
    await this.refreshPromise
    this.refreshPromise = null
    return this.credentials && this.credentials.token
  },

  updateProfile () {
    if (this.profile) {
      redux.dispatch('UPDATE_PROFILE', this.profile)
    } else {
      const profile = redux.getState().profile
      this.profile = profile.toJS()
    }
    if (this.credentials && this.credentials.awsCredential) {
      fileOps.current.fs.updateCredential(this.credentials.awsCredential)
      BuildService.updateCredential(this.credentials.awsCredential)
    }
  },

  shouldRefresh () {
    if (!this.isLogin) {
      return false
    }
    if (!this.credentials || !this.credentials.token) {
      return true
    }
    const { exp } = decode(this.credentials.token)
    const currentTs = Math.floor(Date.now() / 1000)
    return exp - currentTs < 60
  },
}
