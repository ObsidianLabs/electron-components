import AWS from 'aws-sdk/global'
import fileOps from '@obsidians/file-ops'
import decode from 'jwt-decode'
import { BuildService } from '@obsidians/ipc'

import BaseProvider from './base'

class GithubProvider extends BaseProvider {
  constructor() {
    super('github')
    AWS.config.update({ region: this.awsConfig.region })
  }

  get providerUrl() {
    return process.env.REACT_APP_OAUTH_GITHUB_PROVIDER_URL
  }

  get clientId() {
    return process.env.REACT_APP_OAUTH_GITHUB_CLIENT_ID
  }

  get redirectUri() {
    return `${process.env.REACT_APP_OAUTH_GITHUB_REDIRECT_URI}/${this.project}/github`
  }

  get loginUrl() {
    return `${this.providerUrl}?client_id=${this.clientId}&scope=read:user&redirect_uri=${this.redirectUri}`
  }

  get project() {
    if (process.env.REACT_APP_ENV === 'development') {
      return 'eth-test'
    }

    if (process.env.NODE_ENV === 'development') {
      return 'local'
    }

    return process.env.PROJECT
  }

  get awsConfig() {
    return {
      region: process.env.REACT_APP_AWS_REGION,
      roleArn: process.env.REACT_APP_AWS_ROLE_ARN,
      roleSessionName: process.env.REACT_APP_AWS_ROLE_SESSION_NAME
    }
  }

  async grant(code) {
    const tokensResult = await this.fetchTokens(code)
    if (!tokensResult) return {}
    const awsCredential = await this.fetchAwsCredential(tokensResult.awsToken)
    if (!awsCredential) return {}

    return {
      credentials: { token: tokensResult.token, awsCredential },
      profile: decode(tokensResult.token)
    }
  }

  async logout() {
    try {
      await fetch(`${this.serverUrl}/api/v1/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      })
    } catch (error) { }
  }

  async update(credentials) {
    if (credentials && credentials.awsCredential) {
      fileOps.web.fs.updateCredential(credentials.awsCredential)
      BuildService.updateCredential(credentials.awsCredential)
    }
  }

  fetchTokens(code) {
    let body
    let url = `${this.serverUrl}/api/v1/auth/refresh-token`
    let method = 'GET'

    if (code) {
      url = `${this.serverUrl}/api/v1/auth/login`
      method = 'POST'
      body = JSON.stringify({
        code,
        provider: this.name,
        project: this.project
      })
    }

    return fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      method,
      body
    }).then(async (response) => {
      if (response.ok) {
        const { token, awsToken } = await response.json()
        return { token, awsToken }
      } else {
        console.error(await response.json())
        return ''
      }
    })
  }

  async fetchAwsCredential(token) {
    const sts = new AWS.STS()
    const params = {
      WebIdentityToken: token,
      RoleArn: this.awsConfig.roleArn,
      RoleSessionName: this.awsConfig.roleSessionName,
      DurationSeconds: 3600
    }
    try {
      const credential = await new Promise((resolve, reject) => {
        sts.assumeRoleWithWebIdentity(params, (err, data) => err ? reject(err) : resolve(data))
      })
      return credential
    } catch (error) {
      return
    }
  }
}

export default GithubProvider

