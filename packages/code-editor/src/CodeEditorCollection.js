import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { Tabs } from '@obsidians/ui-components'
import fileOps from '@obsidians/file-ops'

import MonacoEditorContainer from './MonacoEditor/MonacoEditorContainer'
import modelSessionManager from './MonacoEditor/modelSessionManager'

export default class CodeEditorCollection extends Component {
  static propTypes = {
    initialTab: PropTypes.object.isRequired,
    onSelectTab: PropTypes.func.isRequired,
    readonly: PropTypes.bool,
    theme: PropTypes.string,
  }

  constructor (props) {
    super(props)
    this.state = {
      selectedTab: props.initialTab
    }
    modelSessionManager.editorContainer = this
    this.tabs = React.createRef()
    this.editorContainer = React.createRef()
  }

  shouldComponentUpdate (props, state) {
    return this.state.selectedTab !== state.selectedTab
  }

  refresh () {
    this.editorContainer?.current.forceUpdate()
  }

  openTab = tab => {
    this.tabs.current.currentTab = tab
  }

  onSelectTab = tab => {
    this.setState({ selectedTab: tab })
    this.props.onSelectTab(tab)
  }

  setCurrentTabUnsaved = unsaved => {
    this.tabs.current.updateTab({ unsaved })
  }

  allUnsavedFiles = () => this.tabs.current.allTabs
    .filter(({ path, unsaved }) => path && unsaved)
    .map(({ path }) => path);

  tryCloseTab = async closingTab => {
    if (closingTab.unsaved) {
      const willClose = await this.promptSave(closingTab.path)
      if (!willClose) {
        return false
      }
    }
    return tab => modelSessionManager.closeModelSession(tab.path)
  }

  closeCurrentFile = () => {
    const { onCloseTab, currentTab } = this.tabs.current
    onCloseTab(currentTab)
  }

  saveFile = async filePath => await modelSessionManager.saveFile(filePath)

  promptSave = async filePath => {
    let clicked = false
    // if (_.platform.isWeb) {
    //   const filename = windowPath.parse(path).base
    //   clicked = await $.modals.open('confirmUnsave', {
    //     title: `Do you want to save the changes in ${filename}?`,
    //     text: `Your changes will be lost if you don't save them.`
    //   })
    //   if (clicked === 'DUN_SAVE') {
    //     return true
    //   } else if (clicked) {
    //     await $.project.save(path)
    //     return true
    //   }
    //   return false
    // } else {
    //   const { response } = await remote.dialog.showMessageBox({
    //     // title: `Do you want to save the changes you made for ${path}?`,
    //     message: 'Your changes will be lost if you close this item without saving.',
    //     buttons: ['Save', 'Cancel', `Don't Save`]
    //   })
    //   clicked = response
    // }

    const { response } = await fileOps.current.showMessageBox({
      // title: `Do you want to save the changes you made for ${path}?`,
      message: 'Your changes will be lost if you close this item without saving.',
      buttons: ['Save', 'Cancel', `Don't Save`]
    })
    clicked = response

    if (clicked === 0) {
      await this.saveFile(filePath)
      return true
    }
    if (clicked === 2) {
      return true
    }
    return false
  }

  closeAll = () => {
    this.tabs.current.allTabs = []
    modelSessionManager.closeAllModelSessions()
  }

  fileSaving = filePath => this.tabs.current.updateTab({ saving: true }, filePath)

  fileSaved = async (filePath, { saveAsPath, unsaved = false } = {}) => {
    const updates = { unsaved, saving: false }
    if (saveAsPath) {
      await this.editorContainer.current?.renameFile(filePath, saveAsPath)
      updates.key = saveAsPath
      updates.path = saveAsPath
    }
    const newTab = this.tabs.current.updateTab(updates, filePath)
    if (saveAsPath) {
      this.onSelectTab(newTab)
    }
  }

  onCommand = cmd => {
    switch (cmd) {
      case 'save':
        modelSessionManager.saveCurrentFile()
        return
      case 'redo':
        modelSessionManager.redo()
        return
      case 'undo':
        modelSessionManager.undo()
        return
      case 'delete':
        modelSessionManager.delete()
        return
      case 'selectAll':
        modelSessionManager.selectAll()
        return
      case 'close-current-tab':
        console.log('close-current-tab')
        return
      case 'project-settings':
        return
      case 'next-tab':
        this.tabs.current.nextTab()
        return
      case 'prev-tab':
        this.tabs.current.prevTab()
    }
  }

  render () {
    return (
      <div className='d-flex w-100 h-100 overflow-hidden bg2'>
        <Tabs
          ref={this.tabs}
          size='sm'
          headerClassName='nav-tabs-dark-active'
          initialSelected={this.props.initialTab}
          onSelectTab={this.onSelectTab}
          tryCloseTab={this.tryCloseTab}
          createNewTab={() => fileOps.current.openNewFile(this.props.projectRoot)}
          getTabText={tab => modelSessionManager.tabTitle(tab)}
        >
          <MonacoEditorContainer
            ref={this.editorContainer}
            theme={this.props.theme}
            path={this.state.selectedTab.path}
            remote={this.state.selectedTab.remote}
            mode={this.state.selectedTab.mode}
            readonly={this.props.readonly}
            onChange={this.setCurrentTabUnsaved}
            onCommand={this.onCommand}
          />
        </Tabs>
      </div>
    )
  }
}
