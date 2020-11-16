import AWS from 'aws-sdk'

const PROJECT = process.env.PROJECT
const region = process.env.REACT_APP_AWS_REGION

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
    try {
      const result = await this.client.queryApiPath(`${PROJECT}/project/${this.project}/build`, 'POST', {
        image: this.image,
        language: this.language,
        cmd: this.cmd
      })
      this.buildId = result._id
  
      await this.checkStatus(onData)
      return { code: this.status === 'SUCCESS' ? 0 : -1, logs: this.status }
    } catch (e) {
      return { code: -1, logs: e }
    }
  }

  async checkStatus (onData, currentToken) {
    const result = await this.client.queryApiPath(`build/${this.buildId}`)
    this.status = result.status

    await delay(2000)

    try {
      if (this.status === 'BUILDING') {
        const nextToken = await this.streamLogs(onData, currentToken)
        await this.checkStatus(onData, nextToken)
      } else if (this.status === 'QUEUED' || this.status === 'PENDING') {
        await this.checkStatus(onData, currentToken)
      } else {
        await this.streamLogs(onData, currentToken)
      }
    } catch (e) {
      await this.checkStatus(onData, currentToken)
    }
  }

  streamLogs (onData, nextToken) {
    const params = {
      logGroupName: 'webIDEbuildLogs',
      logStreamName: this.buildId,
      nextToken
    }
    return new Promise((resolve, reject) => {
      BuildService.watcher.getLogEvents(params, (err, data) => {
        if (err) {
          console.warn(err)
          reject(err)
        } else {
          data.events.forEach(e => onData(`${e.message}\n\r`))
          resolve(data.nextBackwardToken)
        }
      })
    })
  }
}
