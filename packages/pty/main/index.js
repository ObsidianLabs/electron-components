const pty = require('node-pty')
const defaultShell = require('default-shell')
const stripAnsi = require('strip-ansi')
const { spawn } = require('child_process')

class Pty {
  constructor (ipcChannel) {
    this.ipcChannel = ipcChannel
    this.promise = null
  }

  exec (cmd, config = {}) {
    // if (this.promise) {
    //   throw new Error('Pty is already running a process.')
    // }

    let proc
    this.promise = new Promise((resolve, reject) => {
      let switches
      let shell = defaultShell
      if (process.platform === 'win32') {
        // switches = ['/c', ...cmd]
        shell = 'powershell.exe'
        switches = ['-NoLogo', '-NoProfile', '-Command', cmd]
      } else if (defaultShell.indexOf('zsh') > -1) {
        switches = ['--no-globalrcs', '--no-rcs', '-i', '-c', cmd]
      } else {
        shell = '/bin/bash'
        switches = ['--noprofile', '--norc', '-i', '-c', cmd]
      }
      proc = pty.spawn(shell, switches, {
        env: process.env,
        name: this.ipcChannel.channelName,
        cols: 87,
        rows: 19,
        experimentalUseConpty: false,
        ...config,
      })

      let logs = ''
      proc.on('data', data => {
        logs += data
        this.ipcChannel.send('data', data)
        if (config.resolveOnFirstLog) {
          resolve({ logs: stripAnsi(logs) })
        }
        if (config.resolveOnLog) {
          if (config.resolveOnLog.test(logs)) {
            resolve({ logs: stripAnsi(logs) })
          }
        }
      })
  
      proc.on('exit', code => {
        this.promise = null
        resolve({ code, logs: stripAnsi(logs) })
      })
    })
    
    this.promise.proc = proc
    return this.promise
  }

  cp (cmd, config = {}) {
    let proc
    this.promise = new Promise(resolve => {

      proc = spawn(cmd, [], {
        shell: process.platform === 'win32' ? 'powershell.exe' : true,
        ...config
      })

      let logs = ''
      proc.stdout.on('data', data => {
        logs += data
      })

      proc.stderr.on('data', () => {
        resolve({ code: -1 })
      });

      proc.on('close', code => {
        this.promise = null
        resolve({ code, logs: stripAnsi(logs) })
      })
    })
 
    this.promise.proc = proc
    return this.promise
  }

  resize ({ cols, rows }) {
    if (this.promise) {
      this.promise.proc.resize(cols, rows)
    }
  }

  kill (signal) {
    if (this.promise) {
      this.promise.proc.write(Uint8Array.from([0x03, 0x0d])) // send ctrl+c
      // this.proc.kill()
      // reject(new Error(signal))
      return this.promise.catch(e => true)
    }
    return Promise.resolve()
  }
}

module.exports = Pty