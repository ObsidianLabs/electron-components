import AWS from 'aws-sdk'

import { AWSS3Region, AWSBucket } from './config.json'

const region = process.env.REACT_APP_AWS_S3_REGION || AWSS3Region
const Bucket = process.env.REACT_APP_AWS_BUCKET || AWSBucket

export default class AwsS3Fs {
  constructor () {
    this.promises = {
      readFile: this.readFile.bind(this),
      writeFile: this.writeFile.bind(this),
      stat: this.stat.bind(this),
      ensureFile: this.ensureFile.bind(this),
    }
  }

  updateCredential (credential) {
    AWS.config.update({
      region,
      accessKeyId: credential.Credentials.AccessKeyId,
      secretAccessKey: credential.Credentials.SecretAccessKey,
      sessionToken: credential.Credentials.SessionToken,
    })

    this.s3 = new AWS.S3()
  }

  async readFile (filePath, encoding) {
    const params = {
      Bucket,
      Key: filePath,
    }
    const result = await new Promise((resolve, reject) => {
      this.s3.getObject(params, (err, data) => err ? reject(err) : resolve(data))
    })
    return result.Body.toString()
  }

  async writeFile (filePath, content) {
    const params = {
      Bucket,
      Key: filePath,
      Body: content
    }
    await new Promise((resolve, reject) => {
      this.s3.putObject(params, (err, data) => err ? reject(err) : resolve(data))
    })
  }

  async ensureFile (filePath) {
    return this.writeFile(filePath, '')
  }

  async ensureDir (filePath) {
    return this.writeFile(`${filePath}/.placeholder`)
  }

  async deleteFile (filePath) {
    const params = {
      Bucket,
      Key: `${filePath}`,
    }
    await new Promise((resolve, reject) => {
      this.s3.deleteObject(params, (err, data) => err ? reject(err) : resolve(data))
    })
  }

  stat (path) {
    return {
      isDirectory: () => this.isDirectory(path),
      isFile: () => false,
    }
  }

  isDirectory (path) {
    return true
  }

  async list (dirPath) {
    const params = { Bucket, Prefix: dirPath }
    const result = await new Promise((resolve, reject) => {
      this.s3.listObjectsV2(params, (err, data) => err ? reject(err) : resolve(data))
    })
    return result.Contents.map(item => {
      const isDirectory = item.Key.endsWith('/')
      let path = item.Key
      if (isDirectory) {
        path = path.slice(0, -1)
      }
      const name = path.replace(`${dirPath}/`, '')
      const node = { name, path, remote: true }
      if (isDirectory) {
        node.loading = true
        node.children = []
      }
      return node
    }).filter(item => item.name)
  }
}
