import React from 'react'
import * as monaco from 'monaco-editor'
import fileOps from '@obsidians/file-ops' 
import notification from '@obsidians/notification'

import MonacoEditorModelSession from './MonacoEditorModelSession'

export function defaultModeDetector (filePath) {
  if (filePath.startsWith('custom:')) {
    return filePath.substr(7)
  } else if (filePath.endsWith('.cpp') || filePath.endsWith('.hpp')) {
    return 'cpp-eosio'
  } else if (filePath.endsWith('.js')) {
    return 'javascript'
  } else if (filePath.endsWith('.json') || filePath.endsWith('.abi')) {
    return 'json'
  } else if (filePath.endsWith('.md') || filePath.endsWith('.md.in')) {
    return 'markdown'
  } else if (filePath.endsWith('.wasm')) {
    return 'wasm'
  }
}

class ModelSessionManager {
  constructor () {
    this._codeEditor = undefined
    
    this.modeDetector = defaultModeDetector
    this.CustomTabs = {}
    this.customTabTitles = {}

    this.currentModelSession = null
    this.sessions = {}
    this.decorationCollection = {}
  }

  set codeEditor (codeEditor) {
    this._codeEditor = codeEditor
  }

  registerModeDetector (modeDetector) {
    this.modeDetector = modeDetector
  }
  registerCustomTab (mode, CustomTab, title) {
    this.CustomTabs[mode] = CustomTab
    if (title) {
      this.customTabTitles[mode] = title
    }
  }
  tabTitle (tab, mode = this.modeDetector(tab.path)) {
    const modeTitle = this.customTabTitles[tab.mode || mode]
    if (modeTitle) {
      return modeTitle
    } else if (tab.text) {
      return tab.text
    } else if (tab.remote) {
      const basename = fileOps.current.path.basename(tab.path)
      return <span key='cloud-icon'><i className='fas fa-cloud small text-muted mr-1' />{basename}</span>
    } else {
      return fileOps.current.path.basename(tab.path)
    }
  }

  get currentFilePath () {
    return this.currentModelSession?.filePath
  }

  async newModelSession (filePath, remote = false, mode = this.modeDetector(filePath), ) {
    if (!filePath) {
      throw new Error('Empty path for "newModelSession"')
    }

    if (!this.sessions[filePath]) {
      let model = null
      if (!filePath.startsWith('custom:')) {
        const code = await fileOps.current.readFile(filePath)
        model = monaco.editor.createModel(code, mode, monaco.Uri.file(filePath))
      }
      this.sessions[filePath] = new MonacoEditorModelSession(model, remote, this.CustomTabs[mode], this.decorationCollection[filePath] || [])
    }
    return this.sessions[filePath]
  }

  async saveFile (filePath) {
    if (!this.sessions[filePath]) {
      throw new Error(`File "${filePath}" is not open in the current workspace.`)
    }
    await fileOps.current.writeFile(filePath, this.sessions[filePath].value)
    this._codeEditor.fileSaved(filePath)
  }

  async saveCurrentFile () {
    if (!this.currentFilePath) {
      throw new Error('No current file open.')
    }
    try {
      await this.saveFile(this.currentFilePath)
    } catch (e) {
      console.warn(e)
      notification.error('Save Failed', e.message)
    }
  }

  refreshFile (data) {
    if (!this.sessions[data.path]) {
      return
    }
    this.sessions[data.path].refreshValue(data.content)
  }

  updateDecorations (decorationCollection) {
    if (this.decorationCollection) {
      Object.keys(this.decorationCollection).forEach(path => {
        if (this.sessions[path]) {
          this.sessions[path].decorations = decorationCollection[path]
        }
      })
    }

    this.decorationCollection = decorationCollection
    Object.keys(decorationCollection).forEach(path => {
      if (this.sessions[path]) {
        this.sessions[path].decorations = decorationCollection[path]
      }
    })
  }

  closeModelSession (path) {
    if (this.sessions[path]) {
      this.sessions[path].dispose()
      this.sessions[path] = undefined
    }
  }

  closeAllModelSessions () {
    Object.keys(this.sessions).forEach(path => this.closeModelSession(path))
  }
}

export default new ModelSessionManager()