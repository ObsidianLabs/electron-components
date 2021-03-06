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
    const result = await this.s3.getObject(params).promise()
    return result.Body.toString()
  }

  async writeFile (filePath, content) {
    const params = {
      Bucket,
      Key: filePath,
      Body: content
    }
    await this.s3.putObject(params).promise()
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
      Key: filePath,
    }
    await this.s3.deleteObject(params).promise()
  }

  async deleteFolder (dirPath) {
    await this.emptyS3Directory(dirPath)
    const params = {
      Bucket,
      Key: `${dirPath}/`,
    }
    await this.s3.deleteObject(params).promise()
  }

  async emptyS3Directory(dirPath) {
    const listedObjects = await this.s3.listObjectsV2({
      Bucket,
      Prefix: dirPath
    }).promise();
    if (listedObjects.Contents.length === 0) {
      return
    }

    const deleteParams = {
      Bucket,
      Delete: { Objects: [] }
    }
    listedObjects.Contents.forEach(({ Key }) => {
        deleteParams.Delete.Objects.push({ Key })
    })
    await this.s3.deleteObjects(deleteParams).promise()

    if (listedObjects.IsTruncated) {
      await this.emptyS3Directory(dirPath)
    }
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
    const params = {
      Bucket,
      Prefix: `${dirPath}/`,
      Delimiter: '/'
    }
    const result = await this.s3.listObjectsV2(params).promise()

    const folders = result.CommonPrefixes.map(item => {
      const path = item.Prefix.slice(0, -1)
      const name = path.replace(`${dirPath}/`, '')
      return { name, path, children: [], loading: true, remote: true }
    }).filter(item => item.name)
    const files = result.Contents.map(item => {
      let path = item.Key
      const name = path.replace(`${dirPath}/`, '')
      return { name, path, remote: true }
    }).filter(item => item.name && item.name !== '.placeholder')
    return [...folders, ...files]
  }
}
