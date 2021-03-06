import fileOps from '@obsidians/file-ops'
import * as monaco from 'monaco-editor'

const SEVERITIES = {
  note: 2,
  warning: 4,
  error: 8
}

const decos = {
  classNames: {
    error: 'bg-danger-transparent',
    warning: 'bg-warning-transparent',
    note: 'bg-info-transparent'
  },
  glyphMarginClassNames: {
    error: 'fas fa-times-circle text-danger p-half',
    warning: 'fas fa-exclamation-triangle text-warning p-half',
    note: 'fas fa-circle text-info p-half'
  }
}

function generateAnnotation ({ type, text, row, column }) {
  return {
    range: new monaco.Range(row, 0, row, 10000),
    options: {
      isWholeLine: true,
      minimap: type !== 'note',
      // className: EditorSession.decos.classNames[type],
      glyphMarginClassName: decos.glyphMarginClassNames[type]
      // hoverMessage: { value: `\`\`\`\n${text}\n\`\`\`` }
      // glyphMarginHoverMessage: { value: d.type }
    }
  }
}


export default class MonacoEditorModelSession {
  constructor (model, remote, CustomTab, decorations = []) {
    this._model = model
    this._remote = remote
    this._CustomTab = CustomTab
    this._readonly = false
    this._decorations = decorations
    this._showCustomTab = true
    this._viewState = null
  }

  get model () {
    return this._model
  }
  get filePath () {
    let filePath = decodeURIComponent(this._model.uri.toString().replace('file://', ''))
    if (this._remote) {
      filePath = filePath.substr(1)
    } else if (process.env.OS_IS_WINDOWS) {
      filePath = fileOps.current.path.normalize(filePath.substr(1))
      const [root, others] = filePath.split(':')
      filePath = `${root.toUpperCase()}:${others}`
    }
    return filePath
  }
  get CustomTab () {
    return this._CustomTab
  }

  get value () {
    return this._model?.getValue()
  }
  set value (v) {
    this._model?.setValue(v)
  }

  refreshValue (value) {
    if (this.value !== value) {
      this.value = value
    }
  }

  get readonly () {
    return this._readonly
  }
  set readonly (readonly) {
    this._readonly = readonly
  }

  get viewState () {
    return this._viewState
  }
  set viewState (viewState) {
    this._viewState = viewState
  }

  recoverInEditor(monacoEditor) {
    if (!this._model) {
      return
    }

    monacoEditor.setModel(this._model)

    if (this.viewState) {
      monacoEditor.restoreViewState(this.viewState)
    }

    monacoEditor.updateOptions({ readOnly: this.readonly })
    monacoEditor.focus()
  }

  set decorations (decorations = []) {
    if (!this._model) {
      return
    }

    if (!decorations) {
      decorations = []
    }
    const markers = decorations.map(d => this.generateMarkers(d))
    monaco.editor.setModelMarkers(this._model, 'markers', markers)
    this._decorations = this._model.deltaDecorations(this._decorations, decorations.map(generateAnnotation))
  }

  get showCustomTab () {
    return this._showCustomTab
  }
  toggleCustomTab () {
    this._showCustomTab = !this._showCustomTab
  }

  generateMarkers ({ type, text, row, column, notes }) {
    if (!this._model) {
      return
    }
    
    const textLines = text.split('\n')
    if (textLines.length === 4 || textLines.length === 3) {
      const [spaces, tildes] = textLines[2].split('^')

      let startColumn = column
      let endColumn = column + tildes.length
      if (tildes.length === 1) {
        const wordAtPosition = this._model.getWordAtPosition({ lineNumber: row, column })
        if (wordAtPosition) {
          startColumn = wordAtPosition.startColumn
          endColumn = wordAtPosition.endColumn
        }
      }

      return {
      // code: 'code',
      // source: 'source',
        severity: SEVERITIES[type],
        message: textLines[0],
        startLineNumber: row,
        startColumn,
        endLineNumber: row,
        endColumn,
        relatedInformation: notes.map(({ filePath, row, column, text }) => {
          return {
            resource: monaco.Uri.file(filePath),
            message: text.split('\n')[0],
            startLineNumber: row,
            startColumn: column,
            endLineNumber: row,
            endColumn: column
          }
        })
      }
    }

    return {
      severity: SEVERITIES[type],
      message: text,
      startLineNumber: row,
      startColumn: 0,
      endLineNumber: row,
      endColumn: 1000
    }
  }

  dispose () {
    if (this._model) {
      this._model.dispose()
    }
  }
}