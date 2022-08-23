import BaseProvider from './base'
import decode from 'jwt-decode'
import fileOps from '@obsidians/file-ops'
import platform from '@obsidians/platform'
import { BuildService } from '@obsidians/ipc'

class BifProvider extends BaseProvider {
	constructor() {
		super('bif')
	}

	get awsConfig() {
		return {
			region: process.env.REACT_APP_AWS_REGION,
			roleArn: process.env.REACT_APP_AWS_ROLE_ARN,
			roleSessionName: process.env.REACT_APP_AWS_ROLE_SESSION_NAME,
		}
	}

	async request() {
		const { networkManager } = require('@obsidians/network')
		if (networkManager.browserExtension) {
			return await networkManager.browserExtension.auth();
		} else if (networkManager.Sdk) {
			networkManager.browserExtension = new networkManager.Sdk.BrowserExtension(networkManager, window.bifWallet)
			return await networkManager.browserExtension.auth();
		}
	}

	async grant(code) {
		const tokens = await this.fetchTokens(code)
		if (!tokens) {
			return {}
		}
		const { token, awsToken } = tokens

		const awsCredential = await this.fetchAwsCredential(awsToken)
		if (!awsCredential) {
			return {}
		}

		const credentials = { token, awsCredential }
		const profile = decode(token)

		this.profile = profile
		return {
			credentials, profile
		}
	}

	async fetchTokens(code) {
		try {
			let url
			let method
			let body
			if (code) {
				url = `${this.serverUrl}/api/v1/auth/login`
				method = 'POST'
				body = JSON.stringify({
					code,
					provider: 'bif',
					project: this.project
				})
			} else {
				url = `${this.serverUrl}/api/v1/auth/refresh-token`
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
			})

			const { token, awsToken } = await response.json()
			return { token, awsToken }
		} catch (error) {
			return
		}
	}

	async fetchAwsCredential(token) {
		const sts = new AWS.STS()
		const params = {
			WebIdentityToken: token,
			RoleArn: this.awsConfig.roleArn,
			RoleSessionName: this.awsConfig.roleSessionName,
			DurationSeconds: 3600,
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

	done(history) {
		this.profile && history.replace(`/${this.profile.username}`)
	}

	async update(credentials) {
		if (platform.isDesktop) {
			if (credentials && credentials.token) {
				await this.channel.invoke('updateToken', {
					token: credentials.token
				})
			}
		} else {
			if (credentials && credentials.awsCredential) {
				fileOps.web.fs.updateCredential(credentials.awsCredential)
				BuildService.updateCredential(credentials.awsCredential)
			}
		}
	}
}

export default BifProvider
