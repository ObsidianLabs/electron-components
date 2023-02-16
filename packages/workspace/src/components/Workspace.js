import React, { Component } from 'react'
import throttle from 'lodash/throttle'

import {
  SplitPane,
  ToolbarButton
} from '@obsidians/ui-components'

import platform from '@obsidians/platform'
import fileOps from '@obsidians/file-ops'
import CodeEditorCollection from '@obsidians/code-editor'
import FileTree from '@obsidians/filetree'
import { t } from '@obsidians/i18n'

import WorkspaceContext from '../WorkspaceContext'
import BaseProjectManager from '../ProjectManager/BaseProjectManager'
import actions from '../actions'

import contextMenu, { registerHandlers } from './contextMenu'

import CreateFileOrFolderModals from './CreateFileOrFolderModals'
import RenameModal from './RenameModal'
import ActionConfirm from './ActionConfirm'

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

  constructor(props) {
    super(props)
    this.filetree = React.createRef()
    this.codeEditor = React.createRef()
    this.createModal = React.createRef()
    this.renameModal = React.createRef()
    this.confirmModal = React.createRef()
    this.throttledDispatchResizeEvent = throttle(() => {
      window.dispatchEvent(new Event('resize'))
    }, 200)

    this.updateTree = this.updateTree.bind(this)

    this.state = {
      editorConfig: {},
      showTerminal: !!props.terminal,
      terminalSize: 160
    }

    const effect = BaseProjectManager.effect(`settings:editor`, editorConfig => {
      this.state.editorConfig = editorConfig
    })
    this.disposable = effect()

    actions.workspace = this

    registerHandlers({
      newFile: node => this.openCreateFileModal(node),
      newFolder: node => this.openCreateFolderModal(node),
      rename: node => this.openRenameModal(node),
      deleteFile: node => this.openDeleteModal(node),
      openFile: node => this.openFile(node, true),
      duplicateFile: node => this.duplicateFile(node)
    })
    this.setFileTreeActive = this.setFileTreeActive.bind(this)
    this.copyFile = this.copyFile.bind(this)
    this.duplicateFile = this.duplicateFile.bind(this)
    this.openDeleteModal = this.openDeleteModal.bind(this)
    this.openMoveConfirmModal = this.openMoveConfirmModal.bind(this)
  }

  componentDidMount() {
    const editorConfig = this.context.projectSettings.get('editor')
    this.setState({ editorConfig })
  }

  async componentDidUpdate(prevProps) {
    if (prevProps.terminal !== this.props.terminal) {
      if (this.props.terminal) {
        this.setState({
          showTerminal: true,
          terminalSize: this.state.terminalSize || 160
        })
      } else {
        this.setState({ showTerminal: false })
      }
      window.dispatchEvent(new Event('resize'))
    }
  }

  componentWillUnmount() {
    this.disposable()
  }

  tabFromPath = (filePath, remote, pathInProject) => ({ path: filePath, key: filePath, remote, pathInProject })

  setFileTreeActive (path = '') {
    this.filetree.current.setActive(path)
  }

  openFile = ({ path, remote, pathInProject, isLeaf }, setTreeActive) => {
    if (isLeaf || path.endsWith('config.json')) {
      this.codeEditor.current.openTab(this.tabFromPath(path, remote, pathInProject)) // it triggers onSelectTab function eventually
    }
    path.startsWith('custom:') && this.setFileTreeActive()
    setTreeActive && this.setFileTreeActive(path)
  }

  onSelectTab = selectedTab => {
    selectedTab.path && !selectedTab.path.startsWith('custom:')
        ? this.setFileTreeActive(selectedTab.path)
        : this.setFileTreeActive()
  }

  closeAllTabs = () => {

  }

  updateTree() {
    this.filetree.current && this.filetree.current.updateTreeTitle()
  }

  openCreateFileModal = node => {
    const activeNode = node|| this.filetree.current.activeNode || this.filetree.current.rootNode[0]
    const basePath = activeNode.children ? activeNode.path : fileOps.current.path.dirname(activeNode.path)
    let baseName = basePath
    if (platform.isWeb) {
      baseName = activeNode.children ? activeNode.pathInProject : fileOps.current.path.dirname(activeNode.pathInProject)
    }
    this.createModal.current.openCreateFileModal({ baseName, basePath })
  }

  openCreateFolderModal = node => {
    const activeNode = node || this.filetree.current.activeNode || this.filetree.current.rootNode
    const basePath = activeNode.children ? activeNode.path : fileOps.current.path.dirname(activeNode.path)
    let baseName = basePath
    if (platform.isWeb) {
      baseName = activeNode.children ? activeNode.pathInProject : fileOps.current.path.dirname(activeNode.pathInProject)
    }
    this.createModal.current.openCreateFolderModal({ baseName, basePath })
  }

  openRenameModal = node => {
    const activeNode = node || this.filetree.current.activeNode
    const type = activeNode.children ? 'folder' : 'file'
    const { base } = fileOps.current.path.parse(activeNode.path)
    this.renameModal.current.openModal({ type, name: base, oldPath: activeNode.path })
  }

  openDeleteModal (node) {
    const getDeleteModalText = (fileName, isLeaf) => {
      return isLeaf ? {
        mainKey: fileName,
        title: t('project.deleteFile'),
        description: t('project.deleteFileText', {fileName}),
        colorConfirm: 'danger'
      } : {
        mainKey: fileName,
        title: t('project.deleteFolder'),
        description: t('project.deleteFolderText', {fileName}),
        colorConfirm: 'danger'
      }
    }

    const nextFunc = () => {
      this.context.projectManager.deleteFile(node)
    }

    this.confirmModal.current.open({
      content: getDeleteModalText(node.name, node.isLeaf),
      next: nextFunc,
      key: 'skipDeleteConfirm'
    })
  }

  async openMoveConfirmModal(oldNode, newNode) {
    const notValidMove = oldNode.fatherPath === newNode.fatherPath && newNode.isLeaf
    if (oldNode.fatherPath === newNode.path || notValidMove) return
    const checkResult = await this.context.projectManager.checkFileName(oldNode.path, newNode.path)
    if (!checkResult.isExist) {
      await this.context.projectManager.moveOps({
        from: oldNode.path,
        dest: checkResult.finalPath,
        overWrite: false
      })
      return
    }

    const getMoveConfirmText = (fileName, isLeaf) => {
      return isLeaf ? {
        mainKey: fileName,
        title: t('project.existedFile'),
        description: t('project.existedFileText', {fileName}),
        colorConfirm: 'danger'
      } : {
        mainKey: fileName,
        title: t('project.existedFolder'),
        description: t('project.existedFolderText', {fileName}),
        colorConfirm: 'danger'
      }
    }

    const nextFunc = async () => {
      await this.context.projectManager.moveOps({
        from: oldNode.path,
        dest: checkResult.finalPath,
        overWrite: true
      })
    }

    this.confirmModal.current.open({
      content: getMoveConfirmText(oldNode.name, oldNode.isLeaf),
      next: nextFunc,
      key: 'skipMoveConfirm'
    })
  }

  async duplicateFile(node) {
    await this.context.projectManager.copyOps({from: node.path, to: node.path})
  }

  async copyFile(oldNode, newNode, needMove = false) {
    newNode
        ? await this.context.projectManager.copyOps({
          from: oldNode.path,
          to: newNode.path,
          needMove
        })
        : await this.duplicateFile(oldNode)
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
  //   this.codeEditor.current.fileSaved(path, { saveAsPath })
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

  render() {
    const {
      theme,
      initial,
      ProjectToolbar,
      signer,
      Terminal,
      defaultSize,
      readOnly: readOnlyInProps = false,
      makeContextMenu = x => x
    } = this.props

    const readOnly = readOnlyInProps || !this.context.projectManager.userOwnProject && this.context.projectManager.remote

    const {
      editorConfig,
      showTerminal,
      terminalSize
    } = this.state

    let Editor = null
    if (Terminal) {
      Editor = (
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
            key={this.context.projectRoot}
            theme={theme}
            editorConfig={editorConfig}
            initialTab={this.tabFromPath(initial.path, initial.remote, initial.pathInProject)}
            projectRoot={this.context.projectRoot}
            projectManager={this.context.projectManager}
            onSelectTab={this.onSelectTab}
            readOnly={readOnly}
            onChangeDecorations={this.updateTree}
          />
          {Terminal}
        </SplitPane>
      )
    } else {
      Editor = (
        <CodeEditorCollection
          ref={this.codeEditor}
          key={this.context.projectRoot}
          theme={theme}
          editorConfig={editorConfig}
          initialTab={this.tabFromPath(initial.path, initial.remote, initial.pathInProject)}
          projectRoot={this.context.projectRoot}
          projectManager={this.context.projectManager}
          onSelectTab={this.onSelectTab}
          readOnly={readOnly}
          onChangeDecorations={this.updateTree}
        />
      )
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
              tooltip='新建文件'
              readOnly={readOnly}
              onClick={() => this.openCreateFileModal()}
            />
            <ProjectToolbar
              finalCall={this.updateTree}
              signer={signer} />
          </div>
          <FileTree
            ref={this.filetree}
            projectManager={this.context.projectManager}
            initialPath={initial.path}
            onSelect={this.openFile}
            move={this.openMoveConfirmModal}
            copy={this.copyFile}
            readOnly={readOnly}
            contextMenu={makeContextMenu(contextMenu, this.context.projectManager)}
          />
        </div>
        {Editor}
      </SplitPane>
      <CreateFileOrFolderModals
        ref={this.createModal}
        projectManager={this.context.projectManager} />
      <RenameModal
        ref={this.renameModal}
        projectManager={this.context.projectManager} />

      <ActionConfirm ref={this.confirmModal} />
    </>
  }
}
