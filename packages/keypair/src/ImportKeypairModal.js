import React, { PureComponent } from 'react'

import {
  Modal,
  DebouncedFormGroup,
} from '@obsidians/ui-components'

import { kp } from '@obsidians/sdk'

export default class ImportKeypairModal extends PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      name: '',
      valid: false,
      feedback: '',
      keypair: null,
    }

    this.modal = React.createRef()
  }
  

  openModal () {
    this.modal.current.openModal()
    this.setState({ name: '', keypair: null, valid: false, feedback: '' })
    return new Promise(resolve => this.onResolve = resolve)
  }

  onChange = secret => {
    if (!secret) {
      this.setState({ keypair: null, valid: false, feedback: '' })
    } else {
      try {
        const keypair = kp.importKeypair(secret)
        this.setState({
          keypair,
          valid: true,
          feedback: `Address: ${keypair.address}`
        })
      } catch (e) {
        this.setState({ keypair: null, valid: false, feedback: `Not a valid ${this.props.secretName.toLowerCase()}` })
      }
    }
  }

  onConfirm = async () => {
    const { name, keypair } = this.state

    if (!keypair) {
      this.onResolve({})
      return
    }

    this.modal.current.closeModal()
    this.onResolve({ name, keypair })
  }

  render () {
    const {
      name,
      valid,
      feedback,
    } = this.state

    return (
      <Modal
        ref={this.modal}
        title='Import Keypair'
        textConfirm='Import'
        onConfirm={this.onConfirm}
        confirmDisabled={!name || !valid}
      >
        <DebouncedFormGroup
          label='Name'
          maxLength='200'
          placeholder='Please enter a name for the keypair'
          onChange={name => this.setState({ name })}
        />
        <DebouncedFormGroup
          label={`Enter the ${this.props.secretName.toLowerCase()} you want to import`}
          maxLength='200'
          onChange={this.onChange}
          feedback={feedback}
          valid={valid}
        />
      </Modal>
    )
  }
}
