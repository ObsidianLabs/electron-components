import { BSNClientId } from '../../config.json'

const project = process.env.PROJECT
const serverUrl = process.env.REACT_APP_SERVER_URL
const clientId = process.env.REACT_APP_BSN_CLIENT_ID || BSNClientId
const redirectUri = `${serverUrl}/api/v1/auth/callback/${project}/bsn`

export default {
  login (state) {
    window.location.href = `${this.loginUrl}&state=${this.formatState(state)}`
  },
  formatState (state) {
    const stateString = JSON.stringify(state)
    return encodeURIComponent(btoa(stateString))
  },
  restoreState (raw) {
    const stateString = atob(decodeURIComponent(raw))
    return JSON.parse(stateString)
  },
  get loginUrl() {
    return `https://bsn.com/oauth/authorize?response_type=code&client_id=${clientId}&scope=all&redirect_uri=${redirectUri}`
  }
}
