import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { LoadingScreen } from '@obsidians/ui-components'
import modelSessionManager from './modelSessionManager'
import MonacoEditor from './MonacoEditor'
import CustomTabContainer from './CustomTabContainer'

export default class MonacoEditorContainer extends PureComponent {
  static propTypes = {
    readOnly: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    onCommand: PropTypes.func.isRequired,
    onChangeDecorations: PropTypes.func.isRequired,
    updateTabPath: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props)
    this.state = {
      initialized: false,
      loading: false,
      modelSession: null
    }
    this.customTab = React.createRef()
  }

  componentDidMount () {
    this.loadFile(this.props)
    // api.bridge.send('languageClient.create')
  }

  componentDidUpdate (prevProps, prevState) {
    if (prevProps.path !== this.props.path) {
      if (this.props.path) {
        this.loadFile(this.props)
      } else {
        // $.bottomBar.updatePosition()
      }
    }
    if (prevState.modelSession !== this.state.modelSession) {
      modelSessionManager.currentModelSession = this.state.modelSession
    }
  }

  componentWillUnmount () {
    modelSessionManager.closeAllModelSessions()
  }

  async loadFile({ path, remote, mode, readOnly = false }) {
    this.setState({ loading: true })
    try {
      const modelSession = await this.modelSessionFromFile({ path, remote, mode, readOnly })
      this.setState({ initialized: true, loading: false, modelSession })
    } catch {}
    this.setState({ loading: false })
  }

  async modelSessionFromFile({ path, remote, mode, readOnly }) {
    const modelSession = await modelSessionManager.newModelSession(path, remote, mode)
    modelSession.readOnly = readOnly
    return modelSession
  }

  renameFile = async (path, saveAsPath) => {
    // if (this.sessions[saveAsPath]) {
    //   // this.sessions[saveAsPath].
    // } else {
    //   this.sessions[saveAsPath] = await this.modelSessionFromFile(saveAsPath, this.props.readOnly)
    //   if (this.sessions[path]) {
    //     this.sessions[saveAsPath].viewState = this.sessions[path].viewState
    //   }
    //   this.setState({ modelSession: this.sessions[saveAsPath] }, () => modelSessionManager.closeModelSession(path))
    // }
  }

  proxyCommand = (eventType) => {
    this.props.onCommand(eventType)
    eventType === 'save' && this.customTab.current.syncEditStatus()
  }

  quickCommand() {
    this.editor && this.editor.quickCommand()
  }

  render () {
    const { initialized, loading, modelSession } = this.state
    if (!initialized) {
      return <LoadingScreen />
    }

    const { theme, editorConfig, onChange, readOnly, updateTabPath } = this.props

    let topbar = null
    if (modelSession.topbar) {
      topbar = (
        <small className='px-2 border-bottom-black text-muted'>
          {modelSession.topbar.title}
          {modelSession.topbar.actions?.map((action, index) => (
            <a key={`action-${index}`} className='ml-2 cursor-pointer' onClick={action.onClick} >
              {action.text}
            </a>
          ))}
        </small>
      )
    }

    return <>
      {topbar}
      <MonacoEditor
        ref={editor => (this.editor = editor)}
        modelSession={modelSession}
        theme={theme}
        editorConfig={editorConfig}
        onCommand={this.proxyCommand}
        readOnly={readOnly}
        onChange={() => onChange(true)}
        onChangeDecorations={this.props.onChangeDecorations}
      />
      <CustomTabContainer
        ref={this.customTab}
        loading={loading}
        modelSession={modelSession}
        updateTabPath={updateTabPath}
      />
    </>
  }
}
