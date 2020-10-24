import React, { PureComponent } from 'react'

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
      initial: null,
      terminal: false,
      context: {}
    }
  }

  componentDidMount () {
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

  async prepareProject ({ ProjectManager, projectRoot, type }) {
    this.setState({ loading: true, invalid: false, context: {} })

    const projectManager = new ProjectManager[type](this, projectRoot)

    const result = await projectManager.prepareProject()
    if (result.error) {
      this.setState({ loading: false, invalid: true })
    } else {
      this.setState({
        loading: false,
        initial: result.initial,
        context: {
          projectRoot,
          projectManager,
          projectSettings: result.projectSettings,
        }
      })
    }
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

  openProjectSettings = settingsFilePath => {
    this.workspace.current.openFile({ path: settingsFilePath })
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
          initial={this.state.initial}
          terminal={terminal}
          defaultSize={272}
          makeContextMenu={this.props.makeContextMenu}
          ProjectToolbar={ProjectToolbar}
          Terminal={<CompilerTerminal active={terminal} cwd={projectRoot} />}
        />
      </WorkspaceContext.Provider>
    )
  }
}
