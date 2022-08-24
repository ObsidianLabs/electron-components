import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { LoadingScreen } from '@obsidians/ui-components'
import modelSessionManager from './modelSessionManager'
import MonacoEditor from './MonacoEditor'
import CustomTabContainer from './CustomTabContainer'
import {
  UncontrolledButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from '@obsidians/ui-components'
import Tree from 'rc-tree'

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
      modelSession: null,
      dropdownMenuLists: [],
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

  handleSetPosition(_id, target){
    const position = target.node.position
    if (modelSessionManager.monacoEditor) {
      modelSessionManager.monacoEditor.setPosition(position)
    }
  }

  renderSwitcherIcon ({ loading, expanded, data }) {

    if (loading && data.children) {
      return <span key='loading'><span className='fas fa-sm fa-pulse fa-spinner fa-fw' /></span>
    }
  
    if (!data.children) {
      return null
    }
  
    return expanded ? (
      <span key='switch-expanded'><span className='far fa-chevron-down fa-fw' /></span>
    ) : (
      <span key='switch-close'><span className='far fa-chevron-right fa-fw' /></span>
    )
  }

  renderDropDownMenu(label){
    const { modelSession } = this.state
    let expandKeys = []
    for(let item of modelSession.breadcrumb){
      if (item.key === label.key) break
      expandKeys.push(item.key)
    }
    return (
    <Tree
      treeData={modelSession._breadcrumbTree}
      switcherIcon={(nodeProps) =>
          this.renderSwitcherIcon(nodeProps)
      }
      defaultSelectedKeys={[label.key]}
      defaultExpandedKeys={expandKeys}
      onSelect={this.handleSetPosition.bind(this)}
      />
    )
  }

  render () {
    const { initialized, loading, modelSession } = this.state
    if (!initialized) {
      return <LoadingScreen />
    }

    const { theme, editorConfig, onChange, readOnly, updateTabPath } = this.props

    let topbar = null
    let breadcrumb = null
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

    if (modelSession.breadcrumb) {
      const { modelSession } = this.state
      const filename = modelSession.filePath.split('/').pop()
      modelSession.breadcrumb[0].title = filename
      modelSession._breadcrumbTree[0].title = filename
      breadcrumb = (
        <div className='topbar-breadcrumb-box'>
        <div className='px-2 border-bottom-black text-muted topbar-breadcrumb'>
          { modelSession.breadcrumb.map((item, index) => 
            <>
            {index > 0 && <div className='breadcrumb-delimiter' key={`${item.key}-delimter`}>
              <i className="cldr codicon codicon-chevron-right"></i>
            </div>}
            <UncontrolledButtonDropdown direction='down' className={'scope-label'} key={`${item.key}-dropdown`}>
            <DropdownToggle
              size='sm'
              color='default'
              className='rounded-0 text-muted px-2 text-nowrap text-overflow-dots'
            >
              { item.title }
            </DropdownToggle>
            <DropdownMenu right className={'dropdown-menu-sm breadcrumb-dropdown'}>
              { this.renderDropDownMenu(item) }
            </DropdownMenu>
            </UncontrolledButtonDropdown>
            </>
          ) }
        </div>
        </div>
      )
    }

    return <>
      { topbar }
      { breadcrumb }
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
        updateProjectInfo={this.props.updateProjectInfo}
      />
    </>
  }
}
