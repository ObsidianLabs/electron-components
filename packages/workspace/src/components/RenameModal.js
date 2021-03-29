import React, { PureComponent } from 'react'

import {
  Modal,
  DebouncedFormGroup,
} from '@obsidians/ui-components'

import notification from '@obsidians/notification'

export default class RenameModal extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      type: 'file',
      loading: false,
      oldName: '',
      name: '',
      baseName: '',
      basePath: '',
    }
    this.modal = React.createRef()
  }

  openModal = ({ type, name, oldPath }) => {
    this.setState({ type, name, oldName: name, loading: false, oldPath })
    this.modal.current.openModal()
  }

  onRename = async () => {
    const { oldPath, name } = this.state
    try {
      await this.props.projectManager.rename(oldPath, name)
    } catch (e) {
      notification.error('Cannot Rename File', e.message)
      return
    }
    this.setState({ loading: false })
    this.modal.current.closeModal()
  }

  render () {
    return (
      <Modal
        ref={this.modal}
        title={this.state.type === 'file' ? 'Rename File' : 'Rename Folder'}
        textConfirm='Rename'
        pending={this.state.loading && 'Renaming...'}
        confirmDisabled={!this.state.name}
        onConfirm={this.onRename}
      >
        <DebouncedFormGroup
          label={<div>Rename <kbd>{this.state.oldName}</kbd> to</div>}
          placeholder='New name'
          maxLength='50'
          value={this.state.name}
          onChange={name => this.setState({ name })}
        />
      </Modal>
    )
  }
}
