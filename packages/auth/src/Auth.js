import redux from '@obsidians/redux'
import decode from 'jwt-decode'
import AWS from 'aws-sdk'

import fileOps from '@obsidians/file-ops'

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
    let awsToken
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
      awsToken = result.awsToken
    } catch (err) {
      history.replace('/')
      return
    }

    const sts = new AWS.STS()
    const params = {
      WebIdentityToken: awsToken,
      RoleArn: 'arn:aws:iam::023286913450:role/Cognito_webIDE_auth_testAuth_Role',
      RoleSessionName: 'leontest',
      DurationSeconds: 43200,
    }
    const awsCredential = await new Promise((resolve, reject) => {
      sts.assumeRoleWithWebIdentity(params, (err, data) => err ? reject(err) : resolve(data))
    })

    if (!token) {
      history.replace('/')
      return
    }

    const { username, avatar } = decode(token)
    this.profile = { token, username, avatar, awsCredential }
    history.replace('/')
  },

  updateProfile () {
    if (this.profile) {
      redux.dispatch('UPDATE_PROFILE', this.profile)
    } else {
      const profile = redux.getState().profile
      this.profile = profile.toJS()
    }
    if (this.profile.awsCredential) {
      fileOps.current.fs.updateCredential(this.profile.awsCredential)
    }
  },
}
