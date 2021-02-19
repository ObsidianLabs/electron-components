import React, { PureComponent } from 'react'

import {
  Modal,
  DebouncedFormGroup,
} from '@obsidians/ui-components'

import notification from '@obsidians/notification'
import { kp } from '@obsidians/sdk'

import keypairManager from './keypairManager'

export default class ImportKeypairModal extends PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      pending: false,
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
      this.onResolve()
      return
    }

    console.log(this.props.keypairs)
    console.log(keypair)

    if (this.props.keypairs.find(kp => kp.name === name)) {
      notification.error(
        `Create ${name} Failed`,
        `You already have a keypair name ${name}`
      )
      return
    }

    if (this.props.keypairs.find(kp => kp.address === keypair.address)) {
      notification.error(
        `Create ${name} Failed`,
        `You already have a keypair with the same address`
      )
      return
    }

    this.setState({ pending: true })
    await keypairManager.saveKeypair(name, keypair)
    this.setState({ pending: false })

    this.modal.current.closeModal()
    this.onResolve(true)
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
        pending={this.state.pending && 'Importing...'}
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
