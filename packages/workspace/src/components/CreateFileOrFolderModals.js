import React, { PureComponent } from 'react'

import {
  Modal,
  DebouncedFormGroup
} from '@obsidians/ui-components'
import { t } from '@obsidians/i18n'

import notification from '@obsidians/notification'
import actions from '../actions'

export default class CreateFileOrFolderModals extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      type: 'file',
      loading: false,
      name: '',
      baseName: '',
      basePath: ''
    }
    this.modal = React.createRef()
    this.input = React.createRef()
  }

  openCreateFileModal = ({ basePath, baseName }) => {
    this.setState({ type: 'file', loading: false, name: '', baseName, basePath })
    setTimeout(() => this.input.current?.focus(), 100)
    this.modal.current.openModal()
  }

  openCreateFolderModal = ({ basePath, baseName }) => {
    this.setState({ type: 'folder', loading: false, name: '', baseName, basePath })
    setTimeout(() => this.input.current?.focus(), 100)
    this.modal.current.openModal()
  }

  onCreate = async () => {
    const { basePath, name } = this.state
    if (this.state.type === 'file') {
      let filePath
      try {
        filePath = await this.props.projectManager.createNewFile(basePath, name)
      } catch (e) {
        notification.error(t('project.cannotCreateFile'), e.message)
        return
      }
      setTimeout(() => {
        actions.workspace.openFile({ path: filePath }, true)
      }, 500)
    } else if (this.state.type === 'folder') {
      try {
        await this.props.projectManager.createNewFolder(basePath, name)
      } catch (e) {
        notification.error(t('project.cannotCreateFolder'), e.message)
        return
      }
    }
    this.setState({ loading: false })
    this.modal.current.closeModal()
  }

  render () {
    return (
      <Modal
        ref={this.modal}
        title={this.state.type === 'file' ? t('project.newFile') : t('project.newFolder')}
        textConfirm={t('create')}
        pending={this.state.loading && `${t('creating')}...`}
        confirmDisabled={!this.state.name}
        onConfirm={this.onCreate}
      >
        <DebouncedFormGroup
          ref={this.input}
          label={<div>在<kbd>{this.state.baseName}</kbd>创建一个{this.state.type === 'file' ? '文件' : '文件夹'}</div>}
          placeholder={this.state.type === 'file' ? '文件名称' : '文件夹名称'}
          maxLength='50'
          value={this.state.name}
          onChange={name => this.setState({ name })}
        />
      </Modal>
    )
  }
}
