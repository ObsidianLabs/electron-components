const pty = require('node-pty')
const defaultShell = require('default-shell')

class Pty {
  constructor (ipcChannel, cwd) {
    this.ipcChannel = ipcChannel
    this.cwd = cwd
    this.promise = null
    this.config = {}
  }

  get proc () {
    if (!this._proc) {
      this._proc = this.createProc()
    }
    return this._proc
  }

  createProc () {
    let switches
    let shell = defaultShell
    if (process.platform === 'win32') {
      shell = 'powershell.exe'
      switches = ['-NoLogo', '-NoProfile']
    } else if (defaultShell.indexOf('zsh') > -1) {
      switches = ['--no-globalrcs', '--no-rcs', '-i']
    } else {
      shell = '/bin/bash'
      switches = ['--noprofile', '--norc', '-i']
    }

    const proc = pty.spawn(shell, switches, {
      env: process.env,
      name: this.ipcChannel.channelName,
      cols: 87,
      rows: 1,
      useConpty: false,
      cwd: this.cwd,
    })

    let logs = ''
    proc.onData(data => {
      const indexOfPs = data.indexOf(`PS ${this.cwd}>\u001b[0K`)
      if (indexOfPs > -1) {
        if (indexOfPs > 0) {
          logs += data.slice(0, indexOfPs)
          this.ipcChannel.send('data', data.slice(0, indexOfPs))
        }
        this.resolve && this.resolve({ logs })
        return
      }
      logs += data
      this.ipcChannel.send('data', data)
      if (this.config.resolveOnFirstLog) {
        this.resolve({ logs })
      }
      if (this.config.resolveOnLog) {
        if (this.config.resolveOnLog.test(logs)) {
          this.resolve({ logs })
        }
      }
    })

    // proc._agent._$onProcessExit(code => {
    //   console.log('onProcessExit')
    //   // console.log(code)
    // })

    proc.onExit(e => {
      this.promise = null
      this.resolve({ code: e.exitCode, logs })
    })

    return proc
  }

  run (cmd, config = {}) {
    // if (this.promise) {
    //   throw new Error('Pty is already running a process.')
    // }
    this.config = config

    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve
      this.reject = reject
      this.proc.write(`${cmd}\r`)
    })
    
    return this.promise
  }

  resize ({ cols, rows }) {
    if (this.proc) {
      this.proc.resize(cols, rows)
    }
  }

  kill (signal) {
    if (this.promise) {
      this.proc.write(Uint8Array.from([0x03, 0x0d])) // send ctrl+c
      // this.proc.kill()
      // reject(new Error(signal))
      // return this.promise.catch(e => true)
    }
    return Promise.resolve()
  }
}

module.exports = Pty