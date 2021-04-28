import { BsnClientId } from '../../config.json'
// const project = process.env.PROJECT
// const serverUrl = process.env.REACT_APP_SERVER_URL
const clientId = process.env.REACT_APP_BSN_CLIENT_ID || BsnClientId
const redirectUri = `${process.env.REACT_APP_BSN_REDIRECT_URI}?provider=bsn` || 'https://app.obsidians.io/api/v1/auth/callback/bsn/bsn'

export default {
  login () {
    window.location.href = this.loginUrl
  },
  get loginUrl() {
    return `${process.env.REACT_APP_BSN_AUTH_SERVER_URL}?scope=all&client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}`
  }
}
