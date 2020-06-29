import React, { PureComponent } from 'react'

import {
  Modal,
  DebouncedFormGroup,
} from '@obsidians/ui-components'

export default class KeypairNameModal extends PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      name: '',
    }

    this.modal = React.createRef()
    this.input = React.createRef()
  }
  

  openModal (name) {
    this.modal.current.openModal()
    this.setState({ name })
    setTimeout(() => this.input.current.focus(), 100)
    return new Promise(resolve => this.onResolve = resolve)
  }

  onConfirm = async () => {
    const { name } = this.state
    this.modal.current.closeModal()
    this.onResolve(name)
  }

  render () {
    return (
      <Modal
        ref={this.modal}
        title='Modify Keypair Name'
        textConfirm='Save'
        onConfirm={this.onConfirm}
        confirmDisabled={!this.state.name}
      >
        <DebouncedFormGroup
          ref={this.input}
          label='Name'
          maxLength='200'
          placeholder='Please enter a name for the keypair'
          value={this.state.name}
          onChange={name => this.setState({ name })}
        />
      </Modal>
    )
  }
}
