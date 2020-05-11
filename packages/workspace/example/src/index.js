import React, { PureComponent } from 'react'
import ReactDOM from 'react-dom'

import Workspace from '@obsidians/workspace'
import fileOps from '@obsidians/file-ops'
import { useBuiltinCustomTabs } from '@obsidians/code-editor'
import { NotificationSystem } from '@obsidians/notification'

fileOps.fsType = 'electron'
useBuiltinCustomTabs(['markdown', 'settings'])

class App extends PureComponent {
  render () {
    return (
      <React.Fragment>
        <Workspace
          projectRoot='/Users/q/CKB Studio'
          initialFile='custom:settings'
          defaultSize={200}
        />
        <NotificationSystem />
      </React.Fragment>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('root'))
