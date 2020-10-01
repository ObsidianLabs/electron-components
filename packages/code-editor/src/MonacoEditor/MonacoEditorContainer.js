import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'

import {
  LoadingScreen,
} from '@obsidians/ui-components'

import modelSessionManager from './modelSessionManager'

import MonacoEditor from './MonacoEditor'
import CustomTabContainer from './CustomTabContainer'

export default class MonacoEditorContainer extends PureComponent {
  static propTypes = {
    readonly: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    onCommand: PropTypes.func.isRequired
  }

  state = {
    loaded: false,
    modelSession: null
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

  async loadFile ({ path, mode, readonly = false }) {
    const modelSession = await this.modelSessionFromFile({ path, mode, readonly })
    this.setState({ loaded: true, modelSession })
  }

  async modelSessionFromFile ({ path, mode, readonly }) {
    const modelSession = await modelSessionManager.newModelSession(path, mode)
    modelSession.readonly = readonly
    return modelSession
  }

  renameFile = async (path, saveAsPath) => {
    // if (this.sessions[saveAsPath]) {
    //   // this.sessions[saveAsPath].
    // } else {
    //   this.sessions[saveAsPath] = await this.modelSessionFromFile(saveAsPath, this.props.readonly)
    //   if (this.sessions[path]) {
    //     this.sessions[saveAsPath].viewState = this.sessions[path].viewState
    //   }
    //   this.setState({ modelSession: this.sessions[saveAsPath] }, () => modelSessionManager.closeModelSession(path))
    // }
  }

  quickCommand() {
    this.editor && this.editor.quickCommand()
  }

  render () {
    if (!this.state.loaded) {
      return <LoadingScreen />
    }

    const { onCommand, onChange } = this.props

    return <>
      <MonacoEditor
        ref={editor => (this.editor = editor)}
        modelSession={this.state.modelSession}
        theme={this.props.theme}
        onCommand={onCommand}
        onChange={() => onChange(true)}
      />
      <CustomTabContainer
        modelSession={this.state.modelSession}
      />
    </>
  }
}
