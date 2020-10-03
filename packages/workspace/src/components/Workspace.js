import React, { Component } from 'react'

import throttle from 'lodash/throttle'

import {
  SplitPane,
  ToolbarButton,
} from '@obsidians/ui-components'

import fileOps from '@obsidians/file-ops'
import CodeEditorCollection from '@obsidians/code-editor'
import FileTree from '@obsidians/filetree'

import contextMenu, { registerHandlers } from './contextMenu'

import CreateFileOrFolderModals from './CreateFileOrFolderModals'
import ProjectLoading from './ProjectLoading'
import ProjectInvalid from './ProjectInvalid'


const getSizeUpdate = SplitPane.getSizeUpdate
SplitPane.getSizeUpdate = (props, state) => {
  const newState = getSizeUpdate(props, state)
  if (props.adjustSize) {
    newState.pane1Size = props.adjustSize(newState.pane1Size)
    newState.pane2Size = props.adjustSize(newState.pane2Size)
  }
  return newState
}

export default class Workspace extends Component {
  static defaultProps = {
    onToggleTerminal: () => {}
  }

  constructor (props) {
    super(props)
    this.filetree = React.createRef()
    this.codeEditor = React.createRef()
    this.modal = React.createRef()
    this.throttledDispatchResizeEvent = throttle(() => {
      window.dispatchEvent(new Event('resize'))
    }, 200)

    this.state = {
      loading: true,
      invalid: false,
      showTerminal: !!props.terminal,
      terminalSize: 160,
    }

    registerHandlers({
      newFile: node => this.openCreateFileModal(node),
      newFolder: node => this.openCreateFolderModal(node),
    })
  }

  componentDidMount () {
    this.prepareProject(this.props.projectRoot)
  }

  async componentDidUpdate (prevProps) {
    if (this.hasProjectChanged(prevProps, this.props)) {
      this.prepareProject(this.props.projectRoot)
    }

    if (prevProps.terminal !== this.props.terminal) {
      if (this.props.terminal) {
        this.setState({
          showTerminal: true,
          terminalSize: this.state.terminalSize || 160,
        })
      } else {
        this.setState({ showTerminal: false })
      }
      window.dispatchEvent(new Event('resize'))
    }
  }

  hasProjectChanged = (prev, next) => {
    return prev.projectRoot !== next.projectRoot
  }

  prepareProject = async projectRoot => {
    this.setState({ loading: true })
    if (await fileOps.current.isDirectory(projectRoot)) {
      this.setState({ loading: false, invalid: false })
    } else {
      this.setState({ loading: false, invalid: true })
    }
  }

  tabFromPath = filePath => ({ path: filePath, key: filePath })

  openFile = (filePath, setTreeActive) => {
    this.codeEditor.current.openTab(this.tabFromPath(filePath))

    if (filePath.startsWith('custom:')) {
      this.filetree.current.setNoActive()
    } else if (setTreeActive) {
      this.filetree.current.setActive(filePath)
    }
  }

  onSelectTab = selectedTab => {
    if (selectedTab.path && !selectedTab.path.startsWith('custom:')) {
      this.filetree.current.setActive(selectedTab.path)
    } else {
      this.filetree.current.setNoActive()
    }
  }

  closeAllTabs = () => {
    
  }

  openCreateFileModal = node => {
    const activeNode = node || this.filetree.current.activeNode
    let basePath = this.props.projectRoot
    if (activeNode) {
      basePath = activeNode.children ? activeNode.path : fileOps.current.path.dirname(activeNode.path)
    }
    this.modal.current.openCreateFileModal(basePath)
  }

  openCreateFolderModal = node => {
    const activeNode = node || this.filetree.current.activeNode
    let basePath = this.props.projectRoot
    if (activeNode) {
      basePath = activeNode.children ? activeNode.path : fileOps.current.path.dirname(activeNode.path)
    }
    this.modal.current.openCreateFolderModal(basePath)
  }

  saveAll = async () => {
    const unsavedFiles = this.allUnsavedFiles()
    if (!unsavedFiles.length) {
      return { nSaved: 0 }
    }

    for (let i = 0; i < unsavedFiles.length; i++) {
      const filePath = unsavedFiles[i]
      await this.codeEditor.current.saveFile(filePath)
    }
    return { nSaved: unsavedFiles.length }
  }

  allUnsavedFiles = () => this.codeEditor.current.allUnsavedFiles();

  // fileSaved = (path, saveAsPath) => {
  //   this.codeEditor.current.fileSaved(path, saveAsPath)
  // }

  onDragTerminal = size => {
    if (!this.state.showTerminal) {
      if (this.state.terminalSize < 160) {
        this.setState({ terminalSize: 160 })
      }
      this.props.onToggleTerminal(true)
    } else if (size < 50) {
      this.props.onToggleTerminal(false)
      this.setState({ terminalSize: 0 })
    }
  }

  render () {
    const {
      theme,
      projectRoot,
      initialFile,
      ProjectToolbar,
      Terminal = <div></div>,
      defaultSize,
      readonly = false,
      makeContextMenu = x => x,
    } = this.props

    const {
      loading,
      invalid,
      showTerminal,
      terminalSize,
    } = this.state

    if (loading) {
      return <ProjectLoading projectRoot={projectRoot} />
    }

    if (invalid) {
      return <ProjectInvalid projectRoot={projectRoot} />
    }

    return <>
      <SplitPane
        className='obsidians-workspace'
        defaultSize={defaultSize}
        minSize={160}
        onChange={this.throttledDispatchResizeEvent}
        adjustSize={size => {
          if (size && Math.abs(size - defaultSize) < 5) {
            return defaultSize
          }
          return size
        }}
      >
        <div className='d-flex flex-column align-items-stretch h-100'>
          <div className='d-flex border-bottom-1'>
            <ToolbarButton
              id='new'
              icon='fas fa-plus'
              tooltip='New File'
              onClick={() => this.openCreateFileModal()}
            />
            <ProjectToolbar />
          </div>
          <FileTree
            ref={this.filetree}
            projectRoot={projectRoot}
            initialPath={initialFile}
            onSelect={this.openFile}
            readonly={readonly}
            contextMenu={makeContextMenu(contextMenu)}
          />
        </div>
        <SplitPane
          split='horizontal'
          primary='second'
          size={showTerminal ? terminalSize : 0}
          minSize={0}
          onChange={terminalSize => {
            this.setState({ terminalSize })
            this.throttledDispatchResizeEvent()
          }}
          onDragFinished={this.onDragTerminal}
        >
          <CodeEditorCollection
            ref={this.codeEditor}
            theme={theme}
            initialTab={this.tabFromPath(initialFile)}
            projectRoot={projectRoot}
            onSelectTab={this.onSelectTab}
            readonly={readonly}
          />
          {Terminal}
        </SplitPane>
      </SplitPane>
      <CreateFileOrFolderModals ref={this.modal} />
    </>
  }
}
