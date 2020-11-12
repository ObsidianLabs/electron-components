import React, { PureComponent } from 'react'

import {
  Modal,
  DebouncedFormGroup,
} from '@obsidians/ui-components'

import fileOps from '@obsidians/file-ops'
import notification from '@obsidians/notification'

export default class CreateFileOrFolderModals extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      type: 'file',
      loading: false,
      name: '',
      baseName: '',
      basePath: '',
    }
    this.modal = React.createRef()
  }

  openCreateFileModal = ({ basePath, baseName }) => {
    this.setState({ type: 'file', loading: false, name: '', baseName, basePath })
    this.modal.current.openModal()
  }

  openCreateFolderModal = ({ basePath, baseName }) => {
    this.setState({ type: 'folder', loading: false, name: '', baseName, basePath })
    this.modal.current.openModal()
  }

  onCreate = async () => {
    const newPath = fileOps.current.path.join(this.state.basePath, this.state.name)
    if (this.state.type === 'file') {
      try {
        await fileOps.current.createNewFile(newPath)
      } catch (e) {
        notification.error('Cannot Create File', e.message)
        return
      }
    } else if (this.state.type === 'folder') {
      try {
        await fileOps.current.createNewFolder(newPath)
      } catch (e) {
        notification.error('Cannot Create Folder', e.message)
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
        title={this.state.type === 'file' ? 'New File' : 'New Folder'}
        textConfirm='Create'
        pending={this.state.loading && 'Creating...'}
        confirmDisabled={!this.state.name}
        onConfirm={this.onCreate}
      >
        <DebouncedFormGroup
          label={<div>Create a new {this.state.type} in <kbd>{this.state.baseName}</kbd></div>}
          placeholder={this.state.type === 'file' ? 'File name' : 'Folder name'}
          maxLength='50'
          value={this.state.name}
          onChange={name => this.setState({ name })}
        />
      </Modal>
    )
  }
}
