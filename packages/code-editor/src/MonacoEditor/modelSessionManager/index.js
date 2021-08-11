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
    this._editorContainer = null
    this._editor = null
    
    this.modeDetector = defaultModeDetector
    this.CustomTabs = {}
    this.customTabTitles = {}

    this._currentModelSession = null
    this.sessions = {}
    this.decorationCollection = {}
  }

  set editorContainer (editorContainer) {
    this._editorContainer = editorContainer
  }

  set editor (editor) {
    this._editor = editor
  }
  
  get projectManager () {
    return this._editorContainer.props.projectManager
  }

  set currentModelSession (modelSession) {
    if (modelSession.filePath.indexOf('node_modules') > -1) {
      modelSession.setTopbar({ title: `This file is a dependency and changes may have a great impact on the project. Make sure you know what you are doing before making changes.` })
      this._editorContainer.refresh()
    }
    this._currentModelSession = modelSession
  }

  get currentModelSession () {
    return this._currentModelSession
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

  get projectRoot () {
    return this._editorContainer.props.projectRoot
  }
  get currentFilePath () {
    return this.currentModelSession?.filePath
  }

  openFile (filePath, remote = this.projectManager.remote) {
    if (!fileOps.current.path.isAbsolute(filePath)) {
      filePath = fileOps.current.path.join(this.projectRoot, filePath)
    }
    this._editorContainer.openTab({ key: filePath, path: filePath, remote })
  }

  async newModelSession (filePath, remote = false, mode = this.modeDetector(filePath)) {
    if (!filePath) {
      throw new Error('Empty path for "newModelSession"')
    }

    if (!this.sessions[filePath]) {
      let model = null
      if (!filePath.startsWith('custom:')) {
        let content = ''
        try {
          content = await this.projectManager.readFile(filePath)
        } catch (e) {
          console.warn(e)
        }
        const uri = monaco.Uri.file(filePath)
        model = monaco.editor.getModel(uri)
        if (!model) {
          model = monaco.editor.createModel(content, mode, uri)
        }
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
    this.sessions[filePath].saving = true
    if (this.sessions[filePath].topbar) {
      this.sessions[filePath].dismissTopbar()
      this._editorContainer.refresh()
    }
    await this.projectManager.saveFile(filePath, this.sessions[filePath].value)
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
    const content = await this.projectManager.readFile(filePath)
    // this.sessions[filePath].saved = true
    // this._editorContainer.fileSaved(filePath)
    this.sessions[filePath].refreshValue(content)
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
    if (!modelSession || modelSession.saving) {
      return
    }
    if (modelSession.saved) {
      modelSession.refreshValue(data.content)
      this._editorContainer.fileSaved(data.path)
      modelSession.saved = true
    } else {
      modelSession.setTopbar({
        title: `This file is modified outside ${process.env.PROJECT_NAME}.`,
        actions: [
          {
            text: 'Refresh',
            onClick: async () => {
              await this.loadFile(data.path)
              this._editorContainer.fileSaved(data.path)
              modelSession.saved = true
              modelSession.dismissTopbar()
              this._editorContainer.refresh()
            },
          },
          {
            text: 'Keep Current',
            onClick: async () => {
              modelSession.dismissTopbar()
              this._editorContainer.refresh()
            },
          }
        ]
      })
      this._editorContainer.refresh()
    }
  }

  deleteFile (filePath) {
    const modelSession = this.sessions[filePath]
    if (!modelSession) {
      return
    }
    
    modelSession.setTopbar({
      title: `This file is deleted.`,
      actions: [
        {
          text: 'Keep',
          onClick: async () => {
            modelSession.dismissTopbar()
            this._editorContainer.refresh()
          },
        },
        {
          text: 'Discard',
          onClick: async () => {
            modelSession.dismissTopbar()
            this._editorContainer.closeCurrentFile()
          },
        }
      ]
    })
    this._editorContainer.refresh()
  }

  updateDecorations (decorations) {
    const decorationCollection = {}
    decorations.forEach(item => {
      if (!decorationCollection[item.filePath]) {
        decorationCollection[item.filePath] = []
      }
      decorationCollection[item.filePath].push(item)
    })

    if (this.decorationCollection) {
      Object.keys(this.decorationCollection).forEach(filePath => {
        if (this.sessions[filePath]) {
          this.sessions[filePath].decorations = decorationCollection[filePath]
        }
      })
    }

    this.decorationCollection = decorationCollection
    Object.keys(decorationCollection).forEach(filePath => {
      if (this.sessions[filePath]) {
        this.sessions[filePath].decorations = decorationCollection[filePath]
      }
    })
  }

  closeModelSession (filePath) {
    if (this.sessions[filePath]) {
      this.sessions[filePath].dispose()
      this.sessions[filePath] = undefined
    }
  }

  closeAllModelSessions () {
    Object.keys(this.sessions).forEach(filePath => this.closeModelSession(filePath))
  }
}

export default new ModelSessionManager()