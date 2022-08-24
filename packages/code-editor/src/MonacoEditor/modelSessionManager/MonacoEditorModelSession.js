import fileOps from '@obsidians/file-ops'
import * as monaco from 'monaco-editor'
import solidity_parser from 'solidity-parser-diligence'
import debounce from 'lodash/debounce'


const delay = ms => new Promise(res => setTimeout(res, ms))

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
    error: 'fas fa-times-circle text-danger p-1',
    warning: 'fas fa-exclamation-triangle text-warning p-1',
    note: 'fas fa-circle text-info p-1'
  }
}

function generateAnnotation ({ type, text, row = 1, column = 1, length = 0 }) {
  return {
    range: new monaco.Range(row, column, row, column + length),
    options: {
      isWholeLine: true,
      minimap: type !== 'note',
      // className: EditorSession.decos.classNames[type],
      glyphMarginClassName: decos.glyphMarginClassNames[type]
      // hoverMessage: { value: text }
      // glyphMarginHoverMessage: { value: d.type }
    }
  }
}

export default class MonacoEditorModelSession {
  constructor(model, remote, CustomTab, decorations = [], filePath = '') {
    this._model = model
    this._remote = remote
    this._CustomTab = CustomTab
    this._readOnly = false
    this._showCustomTab = true
    this._viewState = null
    this._saved = true
    this._saving = false
    this._topbar = null
    this._breadcrumb = null
    this.decorations = decorations
    this._public = null

    this.initFileType(filePath)
  }

  initFileType(filePath) {
    if (filePath.startsWith('/public') || filePath.startsWith('public')) this._public = true
    if (filePath.startsWith('/private') || filePath.startsWith('private')) this._public = false
  }

  get model () {
    return this._model
  }

  get filePath() {
    let filePath = decodeURIComponent(this._model.uri.toString().replace('file://', ''))
    if (this._remote) {
      if (filePath.startsWith('/')) {
        const slicedPath = filePath.substring(1)
        const pathArr = slicedPath.split('/')
        pathArr[0] = this._public ? 'public' : 'private'
        const finalPath = pathArr.join('/')
        filePath = this._model.uri.path = finalPath
      }
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

  set saved (v) { this._saved = v }
  get saved () { return this._saved }

  set saving (v) {
    if (this._saving) {
      clearTimeout(this._saving)
    }
    this._saving = setTimeout(() => {
      this._saving = false
    }, 1000)
  }
  get saving () { return Boolean(this._saving) }

  get readOnly () {
    return this._readOnly
  }
  set readOnly (readOnly) {
    this._readOnly = readOnly
  }

  get viewState () {
    return this._viewState
  }
  set viewState (viewState) {
    this._viewState = viewState
  }

  get topbar () {
    return this._topbar
  }
  setTopbar (value) {
    this._topbar = value
  }
  dismissTopbar () {
    this._topbar = null
  }

  get breadcrumb () {
    return this._breadcrumb
  }
  setBreadcrumb (breadcrumb, tree) {
    this._breadcrumbTree = tree,
    this._breadcrumb = breadcrumb
    this.refreshEditorContainer && this.refreshEditorContainer()
  }

  setToCurrentCallback() {
    this.getBreadcrumbData({
      lineNumber:1,
      column: 1,
    })
  }

  getBreadcrumbData = debounce(this._getBreadcrumbData.bind(this), 100)

  _getBreadcrumbData(position){
    if (!this.props?.modelSession?.model) this.setBreadcrumb(null)
    const model = this._model
    const language = model.getLanguageIdentifier().language
    const value = model.getValue()
    const LANGUAGE_SUPPORT = ['javascript', 'solidity']
    if (!LANGUAGE_SUPPORT.includes(language)) {
      this.setBreadcrumb(null)
      return
    }
    let getError = false

    const handleTree = {
      position,
      tree: [{}],
      breadcrumbTmp: [],
      breadcrumb: [],
      currentNode: null,
      indexCurrent: 0,
      marked: false,
      start(){
        this.currentNode = this.tree[0]
        this.currentNode.title = '/FILE_NAME/'
        this.currentNode.key = this.indexCurrent
        this.currentNode.parent = this.tree
        this.currentNode.position = {
          lineNumber: 1,
          column: 1,
        }
        this.breadcrumb.push({
          title: this.currentNode.title,
          key: this.currentNode.key,
        })
        this.jumpIn()
      },
      jumpIn(){
        this.breadcrumbTmp.push(null)
        if (!this.marked) this.breadcrumb.push(null)
      },
      addNode(title, position){
        this.indexCurrent++
        if (this.breadcrumbTmp[this.breadcrumbTmp.length - 1] === null) {
          this.currentNode.children = [{
            parent: this.currentNode,
          }]
          this.currentNode = this.currentNode.children[0]
        } else {
          const currentNode = {
            parent: this.currentNode.parent,
          }
          this.currentNode.parent.children.push(currentNode)
          this.currentNode = currentNode
        }
        this.currentNode.title = title
        this.currentNode.key = this.indexCurrent,
        this.currentNode.position = position
        this.breadcrumbTmp[this.breadcrumbTmp.length - 1] = ({
          title,
          key: this.indexCurrent,
        })
        if (!this.marked) this.breadcrumb[this.breadcrumb.length - 1] = ({
          title,
          key: this.indexCurrent,
        })
      },
      jumpOut(){
        this.breadcrumbTmp.pop()
        if (!this.marked) this.breadcrumb.pop()
      },
      end(){
        if (this.breadcrumb[this.breadcrumb.length - 1] === null) this.breadcrumb.pop()
        if (this.breadcrumb.length === 1 && this.tree[0]?.children?.length) {
          this.breadcrumb.push({
            title: this.tree[0].children[0].title,
            key: this.tree[0].children[0].key,
          })
        }
      },
      mark(){
        this.marked = true
      },
    }

    handleTree.start()

    if (language === 'javascript') {

      const token = monaco.editor.tokenize(value, language.language)
      const tag = {
        variable: ['type.identifier.js'],
        scope: ['delimiter.bracket.js'],
      }
      token.forEach((line, count) => {
        const lineNumber = count + 1
        line.forEach((item) => {
          const column = item.offset + 1
          const position = {
            lineNumber,
            column,
          }
          if (lineNumber > handleTree.position.lineNumber || 
            lineNumber === handleTree.position.lineNumber && column >= handleTree.position.column) handleTree.mark()
          if (tag.variable.includes(item.type)){
              const variable = model.getWordAtPosition(position)
              handleTree.addNode(variable.word, position)
          }
          if (tag.scope.length === 2 && tag.scope[0] === item.type) handleTree.jumpIn()
          if (tag.scope.length === 2 && tag.scope[1] === item.type) handleTree.jumpOut()
          if (tag.scope.length === 1 && tag.scope[0] === item.type) {
            const scopeValue = model.getValueInRange({
              startColumn: column,
              endColumn: column + 1,
              startLineNumber: lineNumber,
              endLineNumber: lineNumber,
            })
            if (scopeValue === '{') handleTree.jumpIn() 
            if (scopeValue === '}') handleTree.jumpOut()
          }
        })
      })
    }

    if (language === 'solidity') {
      try{
        const ast = solidity_parser.parse(value, {loc: true})
        const dealWithAst = function(array){
          array.forEach(item => {
            if (item.loc.start.line > handleTree.position.lineNumber
              || item.loc.start.line === handleTree.position.lineNumber && item.loc.start.column >= handleTree.position.column
              ){
                handleTree.mark()
              }

            if (item.type === "ContractDefinition") {
              handleTree.addNode(item.name, {
                column: item.loc.start.column,
                lineNumber: item.loc.start.line,
              })
              if (item.subNodes) {
                handleTree.jumpIn()
                dealWithAst(item.subNodes)
                handleTree.jumpOut()
              }
            }
            if (item.type === "StateVariableDeclaration") {
              handleTree.addNode(item.variables[0].name, {
                column: item.loc.start.column,
                lineNumber: item.loc.start.line,
              })
            }

            if (["EventDefinition", "FunctionDefinition"].includes(item.type)) {
              let name = item.name
              if (!name && item.isConstructor) name = 'constructor()'
              if (!name && !item.isConstructor) name = 'anonymous'
              handleTree.addNode(name, {
                column: item.loc.start.column,
                lineNumber: item.loc.start.line,
              })
            }
          })
        }
        dealWithAst(ast.children)
      }catch(e){
        console.log(e)
        getError = true
      }
    }
    handleTree.end()
    if (!getError) this.setBreadcrumb(handleTree.breadcrumb, handleTree.tree)
  }

  async recoverInEditor (monacoEditor) {
    if (!this._model) {
      return
    }

    await delay(10)

    monacoEditor.setModel(this._model)

    if (this.viewState) {
      monacoEditor.restoreViewState(this.viewState)
    }

    monacoEditor.updateOptions({ readOnly: this.readOnly })
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

  generateMarkers ({ filePath, type, text, row, column, length, notes = [] }) {
    if (!this._model) {
      return
    }

    // const textLines = text.split('\n')
    // if (textLines.length === 4 || textLines.length === 3) {
    //   const [spaces, tildes] = textLines[2].split('^')

    // let startColumn = column
    // let endColumn = column + tildes.length
    // if (tildes.length === 1) {
    //   const wordAtPosition = this._model.getWordAtPosition({ lineNumber: row, column })
    //   if (wordAtPosition) {
    //     startColumn = wordAtPosition.startColumn
    //     endColumn = wordAtPosition.endColumn
    //   }
    // }

    if (typeof row === 'number') {
      if (length) {
        return {
          // code: 'code',
          // source: 'source',
          severity: SEVERITIES[type],
          message: text,
          startLineNumber: row,
          startColumn: column,
          endLineNumber: row,
          endColumn: column + length,
          relatedInformation: [
            // {
            //   resource: monaco.Uri.file(filePath),
            //   message: text,
            //   startLineNumber: row,
            //   startColumn: column,
            //   endLineNumber: row,
            //   endColumn: column + length,
            // }
          ]
        }
      }
      const word = this.model.getWordAtPosition({ column, lineNumber: row })
      return {
        severity: SEVERITIES[type],
        message: text,
        startLineNumber: row,
        startColumn: word ? word.startColumn : column,
        endLineNumber: row,
        endColumn: word ? word.startColumn : column + 1
      }
    }

    return {
      severity: SEVERITIES[type],
      message: text,
      startLineNumber: 1,
      startColumn: 0,
      endLineNumber: 1,
      endColumn: 100,
      relatedInformation: []
    }
  }

  dispose () {
    if (this._model) {
      this._model.dispose()
    }
  }
}
