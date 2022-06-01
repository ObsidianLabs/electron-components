const { app, dialog } = require('electron')
const stripAnsi = require('strip-ansi')
const cp = require('child_process')

class ChildProcess {
  exec (cmd, config = {}) {
    let proc
    return new Promise((resolve, reject) => {
      proc = cp.spawn(cmd, [], {
        shell: process.platform === 'win32' ? 'powershell.exe' : true,
        ...config,
        env: { ...process.env, ...config.env },
      })

      let logs = ''
      proc.stdout.on('data', data => {
        logs += data
      })

      proc.stderr.on('data', data => {
        resolve({ code: -1, logs: data.toString() })
      })

      proc.on('close', code => {
        this.promise = null
        if (process.platform === 'win32') {
          // Windows PowerShell 在启动后会输出 “活动代码页：936 这种文字，需要过滤”
          // 需要检查英文的 windows 系统是否也存在这种问题
          logs = logs.replace(/^.*: \d+\r\n/, '')
        }
        resolve({ code, logs: stripAnsi(logs) })
      })

      proc.on('error', err => {
        if (err.message.indexOf('powershell') > -1) {
          dialog.showErrorBox('PowerShell is not installed', `You need to have PowerShell properly installed to run ${process.env.PROJECT_NAME || 'this application'}.`)
          app.quit()
        }
        reject(err)
      })
    })
  }
}

module.exports = ChildProcess