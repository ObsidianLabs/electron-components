import GithubProvider from './github'
import BsnProvider from './bsn'
import tencent from './tencent'

export default {
  github: new GithubProvider(),
  bsn: new BsnProvider(),
  tencent
}