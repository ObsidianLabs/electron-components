
const project = process.env.PROJECT
const serverUrl = process.env.REACT_APP_SERVER_URL
const githubClientId = process.env.REACT_APP_GITHUB_CLIENT_ID
const redirectUri = `${serverUrl}/api/v1/auth/callback/${project}/github`

export default {
  login () {
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${githubClientId}&scope=read:user&redirect_uri=${redirectUri}`;
  }
}