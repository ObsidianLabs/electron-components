import React from 'react'
import * as monaco from 'monaco-editor'
import fileOps from '@obsidians/file-ops' 
import notification from '@obsidians/notification'

import MonacoEditorModelSession from './MonacoEditorModelSession'

export function defaultModeDetector (filePath) {
  if (filePath.startsWith('custom:')) {
    return filePath.substr(7)
  } else if (filePath.endsWith('.cpp') || filePath.endsWith('.hpp')) {
    return 'cpp'
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
    this._editorContainer = undefined
    this._editor = undefined
    
    this.modeDetector = defaultModeDetector
    this.CustomTabs = {}
    this.customTabTitles = {}

    this.currentModelSession = null
    this.sessions = {}
    this.decorationCollection = {}
  }

  set editorContainer (editorContainer) {
    this._editorContainer = editorContainer
  }

  set editor (editor) {
    this._editor = editor
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

  async newModelSession (filePath, remote = false, mode = this.modeDetector(filePath)) {
    if (!filePath) {
      throw new Error('Empty path for "newModelSession"')
    }

    if (!this.sessions[filePath]) {
      let model = null
      if (!filePath.startsWith('custom:')) {
        let code = ''
        try {
          code = await fileOps.current.readFile(filePath)
        } catch (e) {}
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
    this._editorContainer.fileSaving(filePath)
    await fileOps.current.writeFile(filePath, this.sessions[filePath].value)
    this._editorContainer.fileSaved(filePath)
    this.sessions[filePath].saved = true
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

  async loadFile (filePath) {
    if (!this.sessions[filePath]) {
      throw new Error(`File "${filePath}" is not open in the current workspace.`)
    }
    // this._editorContainer.fileSaving(filePath)
    const code = await fileOps.current.readFile(filePath)
    // this.sessions[filePath].saved = true
    // this._editorContainer.fileSaved(filePath)
    this.sessions[filePath].refreshValue(code)
  }

  undo () {
    if (!this.currentFilePath || !this.sessions[this.currentFilePath]) {
      throw new Error('No current file open.')
    }
    this.sessions[this.currentFilePath].model.undo()
  }

  redo () {
    if (!this.currentFilePath || !this.sessions[this.currentFilePath]) {
      throw new Error('No current file open.')
    }
    this.sessions[this.currentFilePath].model.redo()
  }

  delete () {
    if (!this.currentFilePath || !this.sessions[this.currentFilePath]) {
      throw new Error('No current file open.')
    }
    const model = this.sessions[this.currentFilePath].model
    if (this._editor) {
      const selection = this._editor.getSelection()
      model.pushEditOperations(null, [{
        range: selection,
        text: null,
      }])
    }
  }

  selectAll () {
    if (!this.currentFilePath || !this.sessions[this.currentFilePath]) {
      throw new Error('No current file open.')
    }
    const model = this.sessions[this.currentFilePath].model
    this._editor?.setSelection(model.getFullModelRange())
  }

  refreshFile (data) {
    const modelSession = this.sessions[data.path]
    if (!modelSession) {
      return
    }
    if (modelSession.saved) {
      modelSession.refreshValue(data.content)
      this._editorContainer.fileSaved(data.path)
      modelSession.saved = true
    } else {
      modelSession.setTopbar({ type: 'external', actions: [{
        text: 'Refresh',
        onClick: async () => {
          await this.loadFile(data.path)
          this._editorContainer.fileSaved(data.path)
          modelSession.saved = true
          modelSession.dismissTopbar()
          this._editorContainer.refresh()
        },
      }] })
      this._editorContainer.refresh()
    }
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