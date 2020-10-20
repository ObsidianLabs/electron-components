import redux from '@obsidians/redux'
import decode from 'jwt-decode'
import AWS from 'aws-sdk'

import providers from './providers'

const authServerUrl = process.env.REACT_APP_AUTH_SERVER

export default {
  profile: null,

  login (provider = 'github') {
    if (!providers[provider]) {
      return
    }
    providers[provider].login()
  },

  logout (history) {
    this.profile = {}
    redux.dispatch('CLEAR_USER_PROFILE')
    history.replace('/')
  },

  async handleCallback ({ location, history }) {
    const query = new URLSearchParams(location.search);
    const code = query.get('code')
    const provider = query.get('provider')

    let token
    let awsToken
    try {
      const response = await fetch(`${authServerUrl}/api/v1/auth/login`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({ code, provider })
      });
      const result = await response.json()
      token = result.token
      awsToken = result.awsToken
    } catch (err) {
      history.replace('/')
      return
    }

    const credential = await new Promise(resolve => {
      const sts = new AWS.STS();
      const params = {
        WebIdentityToken: awsToken,
        RoleArn: 'arn:aws:iam::023286913450:role/Cognito_webIDE_auth_testAuth_Role',
        RoleSessionName: 'leontest',
        DurationSeconds: 43200,
      };
      sts.assumeRoleWithWebIdentity(params, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else resolve(data); // successful response
      });
    });

    console.log('credential', credential);

    const accessKeyId = credential.Credentials.AccessKeyId;
    const secretAccessKey = credential.Credentials.SecretAccessKey;
    const sessionToken = credential.Credentials.SessionToken;

    AWS.config.update({
      accessKeyId,
      secretAccessKey,
      sessionToken,
    });


    const s3 = new AWS.S3();

    // List
    const s3ListResponse = await new Promise(resolve => {
      const params = {
        Bucket: 'webidetest',
        Prefix: 'public/',
      };
      s3.listObjectsV2(params, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else resolve(data); // successful response
      });
    });
    console.log('s3ListResponse', s3ListResponse);


    // Create
    const s3PutResponse = await new Promise(resolve => {
      const params = {
        Bucket: 'webidetest',
        Key: 'public/test.txt',
        Body: 'test string from putObject'
      };
      s3.putObject(params, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else resolve(data); // successful response
      });
    })
    console.log('s3PutResponse', s3PutResponse)


    // Read
    const s3GetResponse = await new Promise(resolve => {
      const params = {
        Bucket: 'webidetest',
        Key: 'public/test.txt',
      };
      s3.getObject(params, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else resolve(data); // successful response
      });
    });
    console.log('s3GetResponse', s3GetResponse);


    // Delete
    const s3DeleteResponse = await new Promise(resolve => {
      const params = {
        Bucket: 'webidetest',
        Key: 'public/test.txt',
      };
      s3.deleteObject(params, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else resolve(data); // successful response
      });
    })
    console.log('s3DeleteResponse', s3DeleteResponse)


    // List
    const s3ListResponse2 = await new Promise(resolve => {
      const params = {
        Bucket: 'webidetest',
        Prefix: 'public/',
      };
      s3.listObjectsV2(params, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else resolve(data); // successful response
      });
    });
    console.log('s3ListResponse2', s3ListResponse2);

    if (!token) {
      history.replace('/')
      return
    }

    const { username, avatar } = decode(token)
    this.profile = { token, username, avatar }
    history.replace('/')
  },

  updateProfile () {
    if (this.profile) {
      redux.dispatch('UPDATE_PROFILE', this.profile)
    } else {
      const profile = redux.getState().profile
      this.profile = profile.toJS()
    }
  },
}
