import AWS from 'aws-sdk/global'
import CloudWatchLogs from 'aws-sdk/clients/cloudwatchlogs'
import io from 'socket.io-client'

const PROJECT = __process.env.PROJECT
const region = __process.env.REACT_APP_AWS_REGION
const delay = ms => new Promise(res => setTimeout(res, ms))

export default class BuildService {
  constructor(client, opt = {}) {
    this.client = client
    this.image = opt.image || ''
    this.language = opt.language || ''
    this.cmd = opt.cmd || ''
    this.project = opt.project || ''
    this.buildId = ''
    this.status = ''
    this.onData = () => {}
    this.noMoreLog = false
    this.nextToken = undefined
    this.abort = false
  }

  static updateCredential (credential) {
    AWS.config.update({
      region,
      accessKeyId: credential.Credentials.AccessKeyId,
      secretAccessKey: credential.Credentials.SecretAccessKey,
      sessionToken: credential.Credentials.SessionToken,
    })

    BuildService.watcher = new CloudWatchLogs()
  }

  async start (onData) {
    try {
      const result = await this.client.queryApiPath(`${PROJECT}/project/${this.project}/build`, 'POST', {
        image: this.image,
        language: this.language,
        cmd: this.cmd
      })
      this.buildId = result._id
      this.onData = onData
  
      await this.checkStatus()
      return { code: this.status === 'SUCCESS' ? 0 : -1, logs: this.status }
    } catch (e) {
      return { code: -1, logs: e }
    }
  }

  async stop () {
    // TODO: stop build task by sending a request to server
    this.abort = true
  }

  async checkStatus () {
    if (this.abort) {
      return
    }
    await this.streamLogs()

    await delay(1000)

    const result = await this.client.queryApiPath(`build/${this.buildId}`)
    this.status = result.status
    console.log(result, 'result')
    // try {
    //   if (this.status === 'PENDING') {
    //     await this.checkStatus()
    //   } else if (this.status === 'BUILDING' || !this.noMoreLog) {
    //     // await this.streamLogs()
    //     await this.checkStatus()
    //   }
    // } catch (e) {
    //   await this.checkStatus()
    // }
  }

  async streamLogs () {
    const socket = io("http://localhost:7001")
    socket.on("buildLog", (socket) => {
        this.onData(`${socket}\n\r`)
    })
  }
}
