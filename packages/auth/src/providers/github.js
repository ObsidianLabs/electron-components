
const project = process.env.REACT_APP_AUTH_PROJECT || process.env.PROJECT
const authServerUrl = process.env.REACT_APP_AUTH_SERVER
const githubClientId = process.env.REACT_APP_GITHUB_CLIENT_ID
const redirectUri = `${authServerUrl}/api/v1/auth/callback/${project}/github`

export default {
  login () {
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${githubClientId}&scope=read:user&redirect_uri=${redirectUri}`;
  }
}