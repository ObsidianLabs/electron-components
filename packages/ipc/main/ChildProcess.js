const stripAnsi = require('strip-ansi')
const cp = require('child_process')

class ChildProcess {
  exec (cmd, config = {}) {
    let proc
    return new Promise(resolve => {
      proc = cp.spawn(cmd, [], {
        shell: process.platform === 'win32' ? 'powershell.exe' : true,
        ...config
      })

      let logs = ''
      proc.stdout.on('data', data => {
        logs += data
      })

      proc.stderr.on('data', data => {
        resolve({ code: -1, logs: data.toString() })
      });

      proc.on('close', code => {
        this.promise = null
        resolve({ code, logs: stripAnsi(logs) })
      })
    })
  }
}

module.exports = ChildProcess