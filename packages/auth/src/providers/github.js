import { GithubClientId } from '../../config.json'

const {
  NODE_ENV,
  PROJECT,
  REACT_APP_SERVER_URL: serverUrl,
  REACT_APP_GITHUB_CLIENT_ID: clientId = GithubClientId,
} = process.env

const project = NODE_ENV === 'development' ? 'local' : PROJECT
const redirectUri = `${serverUrl}/api/v1/auth/callback/${project}/github`

export default {
  login () {
    window.location.href = this.loginUrl
  },
  get loginUrl() {
    return `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=read:user&redirect_uri=${redirectUri}`
  }
}