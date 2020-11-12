import AWS from 'aws-sdk'

const PROJECT = process.env.PROJECT
const region = process.env.REACT_APP_AWS_S3_REGION

const delay = ms => new Promise(res => setTimeout(res, ms))

export default class BuildService {
  constructor(client, opt = {}) {
    this.client = client
    this.cmd = opt.cmd || ''
    this.project = opt.project || ''
    this.buildId = ''
    this.status = ''
  }

  static updateCredential (credential) {
    AWS.config.update({
      region,
      accessKeyId: credential.Credentials.AccessKeyId,
      secretAccessKey: credential.Credentials.SecretAccessKey,
      sessionToken: credential.Credentials.SessionToken,
    })

    BuildService.watcher = new AWS.CloudWatchLogs()
  }

  async start (onData) {
    const result = await this.client.queryApiPath(`${PROJECT}/project/${this.project}/build`, 'POST', { cmd: this.cmd })
    this.buildId = result._id

    while (!this.status || this.status === 'QUEUED') {
      await delay(2000)
      await this.checkStatus()
    }

    await this.streamLogs(onData)
  }

  async checkStatus () {
    const result = await this.client.queryApiPath(`build/${this.buildId}`)
    this.status = result.status
    console.log(result.status)
    return this.status
  }

  streamLogs (onData) {
    const params = {
      logGroupName: 'webIDEbuildLogs',
      logStreamName: this.buildId,
    }
    return new Promise((resolve, reject) => {
      this.watcher.getLogEvents(params, (err, data) => {
        if (err) {
          console.warn(err)
          reject(err)
        } else {
          data.events.forEach(e => onData(`${e.message}\n\r`))
        }
      })

      const h = setInterval(() => {
        this.checkStatus().then(status => {
          console.log(status)
          if (status === 'COMPLETED') {
            clearInterval(h)
          }
        })
      }, 2000)
    })
  }
}
