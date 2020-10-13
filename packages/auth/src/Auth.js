import redux from '@obsidians/redux'
import decode from 'jwt-decode'

export default class Auth {
  constructor(authServerUrl, project) {
    this.authServerUrl = authServerUrl || process.env.AUTH_SERVER
    this.project = project || process.env.BUILD
  }

  login(provider = 'github') {
    window.location.href = `https://github.com/login/oauth/authorize?client_id=0719e502c798dd4bb376&scope=read:user&redirect_uri=${this.authServerUrl}/api/v1/auth/callback/${this.project}/${provider}`;
  }

  async loginToAuthServer(props) {
    const query = new URLSearchParams(props.location.search);
    const code = query.get('code')
    const provider = query.get('provider')

    let token
    try {
      const response = await fetch(`${this.authServerUrl}/api/v1/auth/login`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({ code, provider })
      });
      const result = await response.json()
      token = result.token
    } catch (error) {
      props.history.push('/')
      return null
    }

    if (!token) {
      props.history.push('/')
      return null
    }

    const { username, avatar } = decode(token)
    redux.dispatch('UPDATE_PROFILE', { token, username, avatar })
    props.history.push('/')
  }

  handleCallback(props) {
    this.loginToAuthServer(props)
    return null
  }
}
