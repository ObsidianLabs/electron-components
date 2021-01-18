import { GithubClientId } from '../../config.json'

const project = process.env.PROJECT
const serverUrl = process.env.REACT_APP_SERVER_URL
const githubClientId = process.env.REACT_APP_GITHUB_CLIENT_ID || GithubClientId
const redirectUri = `${serverUrl}/api/v1/auth/callback/${project}/github`

export default {
  login () {
    window.location.href = this.loginUrl;
  },
  get loginUrl() {
    return `https://github.com/login/oauth/authorize?client_id=${githubClientId}&scope=read:user&redirect_uri=${redirectUri}`
  }
}