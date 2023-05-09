import AWS from 'aws-sdk/global'
import S3 from 'aws-sdk/clients/s3'
import path from 'path-browserify'
import { AWSS3Region, AWSBucket } from './config.json'

const notValid = (oldValue, newVal) => oldValue === newVal
const region = __process.env.REACT_APP_AWS_REGION
const Bucket = __process.env.REACT_APP_AWS_BUCKET
const endpoint = __process.env.REACT_APP_AWS_ENDPOINT
const ak = __process.env.REACT_APP_AWS_AK
const sk = __process.env.REACT_APP_AWS_SK

export default class AwsS3Fs {
  constructor() {
    this.promises = {
      readFile: this.readFile.bind(this),
      writeFile: this.writeFile.bind(this),
      stat: this.stat.bind(this),
      ensureFile: this.ensureFile.bind(this)
    }
    AWS.config.update({
      accessKeyId: ak,
      secretAccessKey: sk,
      region,
      s3ForcePathStyle: true,
      endpoint: new AWS.Endpoint(endpoint)
      // sessionToken: credential.Credentials.SessionToken
    })

    this.s3 = new S3()
  }

  updateCredential (credential) {
    AWS.config.update({
      accessKeyId: ak,
      secretAccessKey: sk,
      region,
      s3ForcePathStyle: true,
      endpoint: new AWS.Endpoint(endpoint)
      // sessionToken: credential.Credentials.SessionToken
    })

    this.s3 = new S3()
  }

  async deepFind(dirPath, executor, initialData) {
    const fetchFile = async (dirPath) => {
      const { CommonPrefixes, Contents } = await this.s3.listObjectsV2({
        Bucket,
        Prefix: `${dirPath}`,
        Delimiter: '/'
      }).promise()
      initialData[dirPath] = executor({ CommonPrefixes, Contents })
      if (!CommonPrefixes.length) return
      CommonPrefixes.forEach(item => { fetchFile(item.Prefix) })
    }
    await fetchFile(dirPath)
    return initialData
  }

  async readFile(filePath, { encoding } = {}) {
    if (filePath.startsWith('/')) {
      filePath = filePath.substr(1)
    }
    const params = {
      Bucket,
      Key: filePath
    }
    const result = await this.s3.getObject(params).promise()
    return result.Body.toString(encoding)
  }

  async writeFile(filePath, content) {
    const params = {
      Bucket,
      Key: filePath,
      Body: content
    }
    await this.s3.putObject(params).promise()
  }

  async ensureFile(filePath) {
    return this.writeFile(filePath, '')
  }

  async ensureDir(filePath) {
    return this.writeFile(`${filePath}/.placeholder`)
  }

  async rename(oldPath, newPath) {
    if (notValid(oldPath, newPath)) return
    const isFile = !oldPath.endsWith('/')

    if (isFile) { // rename file
      let fileExists = false
      try {
        await this.readFile(newPath, {})
        fileExists = true
      } catch (error) {
        fileExists = false
      }
      if (fileExists) {
        throw new Error(`${newPath} exists.`)
      }

      await this.copyFile(oldPath, newPath)
      await this.deleteFile(oldPath)
    } else { // rename folder
      const executor = ({ Contents }) => {
        Contents.forEach(async ({ Key }) => {
          await this.copyFile(Key, Key.replace(oldPath, newPath))
          await this.deleteFile(Key)
        })
      }
      await this.deepFind(oldPath, executor, [])
      await this.deleteFolder(oldPath)
    }
  }

  async copyFile (oldPath, newPath) {
    await this.s3.copyObject({
      CopySource: `/${Bucket}/${oldPath}`,
      Bucket,
      Key: newPath
    }).promise()
  }

  async copyFolder (oldPath, newPath) {}

  async moveFile (oldPath, newPath) {}

  async moveFolder (oldPath, newPath) {}

  async deleteFile (filePath) {
    const params = {
      Bucket,
      Key: filePath
    }
    await this.s3.deleteObject(params).promise()
  }

  async deleteFolder (dirPath) {
    await this.emptyS3Directory(dirPath)
    const params = {
      Bucket,
      Key: `${dirPath}/`
    }
    await this.s3.deleteObject(params).promise()
  }

  async emptyS3Directory(dirPath) {
    const listedObjects = await this.s3.listObjectsV2({
      Bucket,
      Prefix: dirPath
    }).promise()
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

  async stat(fileOrDirPath) {
    if (fileOrDirPath.startsWith('/')) {
      fileOrDirPath = fileOrDirPath.substr(1)
    }
    const { dir, base } = path.parse(fileOrDirPath)
    const list = await this.list(dir)
    const match = list.find(item => item.name === base)
    return {
      isDirectory: () => match && !!match.children,
      isFile: () => match && !match.children
    }
  }

  async list(dirPath) {
    dirPath = dirPath.endsWith('/') ? dirPath : `${dirPath}/`
    const formatFolders = commonPrefixes => {
      return commonPrefixes.length ? commonPrefixes.reduce((prev, cur) => {
        const path = cur.Prefix.slice(0, -1)
        const name = path.replace(`${dirPath}`, '')
        name && prev.push({
          type: 'folder',
          title: name,
          key: path,
          children: [],
          isLeaf: false,
          name,
          path,
          fatherPath: dirPath,
          loading: true,
          remote: true,
          className: ''
        })
        return prev
      }, []) : []
    }

    const formatFile = contents => {
      return contents.length ? contents.reduce((prev, cur) => {
        let path = cur.Key
        const name = path.replace(`${dirPath}`, '')
        const valid = name && name !== '.placeholder'
        valid && prev.push({
          type: 'file',
          title: name,
          key: path,
          name,
          path,
          fatherPath: dirPath,
          remote: true,
          isLeaf: true,
          className: ''
        })
        return prev
      }, []) : []
    }

    const { CommonPrefixes, Contents } = await this.s3.listObjectsV2({
      Bucket,
      Prefix: `${dirPath}`,
      Delimiter: '/'
    }).promise()

    return [...(formatFolders(CommonPrefixes)), ...(formatFile(Contents))]
  }
}
