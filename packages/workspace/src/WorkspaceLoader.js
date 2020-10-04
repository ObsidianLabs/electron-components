import React, { PureComponent } from 'react'

import fileOps from '@obsidians/file-ops'

import Workspace from './components/Workspace'
import WorkspaceContext from './WorkspaceContext'

import ProjectLoading from './components/ProjectLoading'
import ProjectInvalid from './components/ProjectInvalid'

export default class WorkspaceLoader extends PureComponent {
  constructor (props) {
    super(props)
    this.workspace = React.createRef()
    this.state = {
      loading: true,
      invalid: false,
      initialFile: undefined,
      terminal: false,
      context: {}
    }
  }

  componentDidMount () {
    this.props.projectManager.project = this
    this.props.addLanguages && this.props.addLanguages()
    this.prepareProject(this.props)
  }

  componentDidUpdate (prevProps, prevState) {
    if (this.state.terminal !== prevState.terminal) {
      window.dispatchEvent(new Event('resize'))
    }
    if (this.props.projectRoot !== prevProps.projectRoot) {
      this.prepareProject(this.props)
    }
  }

  async prepareProject ({ projectManager, projectRoot }) {
    this.setState({ loading: true, invalid: false, context: {} })

    if (!await fileOps.current.isDirectory(projectRoot)) {
      this.setState({ loading: false, invalid: true })
      return
    }

    let projectSettings
    try {
      projectSettings = await projectManager.readProjectSettings()
    } catch (e) {
      console.warn(e)
      this.setState({
        loading: false,
        initialFile: projectManager.settingsFilePath,
      })
      return
    }

    this.setState({ context: {
      projectRoot,
      projectSettings,
    } })

    if (await projectManager.isMainValid()) {
      this.setState({
        loading: false,
        initialFile: projectManager.mainFilePath,
      })
      return
    }

    this.setState({
      loading: false,
      initialFile: projectManager.settingsFilePath,
    })
  }

  saveAll = async () => {
    return await this.workspace.current.saveAll()
  }

  toggleTerminal = terminal => {
    this.setState({ terminal })
    if (terminal) {
      this.props.compilerManager.focus()
    }
  }

  openProjectSettings = () => {
    this.workspace.current.openFile(this.props.projectManager.settingsFilePath)
  }

  render () {
    const {
      projectRoot,
      InvalidProjectActions = null,
      ProjectToolbar,
      CompilerTerminal,
    } = this.props
    const { terminal } = this.state

    if (this.state.loading) {
      return <ProjectLoading projectRoot={projectRoot} />
    }

    if (this.state.invalid) {
      return (
        <ProjectInvalid projectRoot={projectRoot || '(undefined)'}>
          {InvalidProjectActions}
        </ProjectInvalid>
      )
    }

    return (
      <WorkspaceContext.Provider value={this.state.context}>
        <Workspace
          ref={this.workspace}
          theme={this.props.theme}
          projectRoot={projectRoot}
          initialFile={this.state.initialFile}
          terminal={terminal}
          defaultSize={272}
          makeContextMenu={this.props.makeContextMenu}
          ProjectToolbar={ProjectToolbar}
          onToggleTerminal={terminal => this.props.projectManager.toggleTerminal(terminal)}
          Terminal={<CompilerTerminal active={terminal} cwd={projectRoot} />}
        />
      </WorkspaceContext.Provider>
    )
  }
}
