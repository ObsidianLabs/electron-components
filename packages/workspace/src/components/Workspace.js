import React, { Component } from 'react'

import throttle from 'lodash/throttle'

import {
  SplitPane,
  ToolbarButton,
} from '@obsidians/ui-components'

import platform from '@obsidians/platform'
import fileOps from '@obsidians/file-ops'
import CodeEditorCollection from '@obsidians/code-editor'
import FileTree from '@obsidians/filetree'

import WorkspaceContext from '../WorkspaceContext'

import contextMenu, { registerHandlers } from './contextMenu'

import CreateFileOrFolderModals from './CreateFileOrFolderModals'

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
  static contextType = WorkspaceContext

  constructor (props) {
    super(props)
    this.filetree = React.createRef()
    this.codeEditor = React.createRef()
    this.modal = React.createRef()
    this.throttledDispatchResizeEvent = throttle(() => {
      window.dispatchEvent(new Event('resize'))
    }, 200)

    this.state = {
      showTerminal: !!props.terminal,
      terminalSize: 160,
    }

    registerHandlers({
      newFile: node => this.openCreateFileModal(node),
      newFolder: node => this.openCreateFolderModal(node),
      deleteFile: node => this.context.projectManager.deleteFile(node),
    })
  }

  async componentDidUpdate (prevProps) {
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

  tabFromPath = (filePath, remote) => ({ path: filePath, key: filePath, remote })

  openFile = ({ path, remote }, setTreeActive) => {
    this.codeEditor.current.openTab(this.tabFromPath(path, remote))

    if (path.startsWith('custom:')) {
      this.filetree.current.setNoActive()
    } else if (setTreeActive) {
      this.filetree.current.setActive(path)
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
    const activeNode = node || this.filetree.current.activeNode || this.filetree.current.rootNode
    const basePath = activeNode.children ? activeNode.path : fileOps.current.path.dirname(activeNode.path)
    let baseName = basePath
    if (platform.isWeb) {
      baseName = activeNode.children ? activeNode.pathInProject : fileOps.current.path.dirname(activeNode.pathInProject)
    }
    this.modal.current.openCreateFileModal({ baseName, basePath })
  }

  openCreateFolderModal = node => {
    const activeNode = node || this.filetree.current.activeNode || this.filetree.current.rootNode
    const basePath = activeNode.children ? activeNode.path : fileOps.current.path.dirname(activeNode.path)
    let baseName = basePath
    if (platform.isWeb) {
      baseName = activeNode.children ? activeNode.pathInProject : fileOps.current.path.dirname(activeNode.pathInProject)
    }
    this.modal.current.openCreateFolderModal({ baseName, basePath })
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
      this.context.projectManager.toggleTerminal(true)
    } else if (size < 50) {
      this.context.projectManager.toggleTerminal(false)
      this.setState({ terminalSize: 0 })
    }
  }

  render () {
    const {
      theme,
      initial,
      ProjectToolbar,
      Terminal = <div></div>,
      defaultSize,
      readonly = false,
      makeContextMenu = x => x,
    } = this.props

    const {
      showTerminal,
      terminalSize,
    } = this.state

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
            projectManager={this.context.projectManager}
            initialPath={initial.path}
            onSelect={this.openFile}
            readonly={readonly}
            contextMenu={makeContextMenu(contextMenu, this.context.projectManager)}
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
            initialTab={this.tabFromPath(initial.path, initial.remote)}
            projectRoot={this.context.projectRoot}
            onSelectTab={this.onSelectTab}
            readonly={readonly}
          />
          {Terminal}
        </SplitPane>
      </SplitPane>
      <CreateFileOrFolderModals
        ref={this.modal}
        projectManager={this.context.projectManager}
      />
    </>
  }
}
