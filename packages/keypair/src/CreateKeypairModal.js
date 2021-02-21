import React, { PureComponent } from 'react'

import {
  Modal,
  Badge,
  DebouncedFormGroup,
} from '@obsidians/ui-components'

import notification from '@obsidians/notification'

import keypairManager from './keypairManager'

export default class CreateKeypairModal extends PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      pending: false,
      name: '',
      keypair: null,
    }

    this.modal = React.createRef()
  }

  openModal () {
    this.modal.current.openModal()
    setTimeout(() => this.regenerateKeypair(), 500)
    return new Promise(resolve => this.onResolve = resolve)
  }

  regenerateKeypair = async () => {
    const keypair = await keypairManager.newKeypair()
    this.setState({ keypair })
  }

  onConfirm = async () => {
    const { name, keypair } = this.state

    if (!keypair) {
      this.onResolve()
      return
    }

    if (this.props.keypairs.find(kp => kp.name === name)) {
      notification.error(
        `Create Keypair Failed`,
        `The keypair name <b>${name}</b> has already been used.`
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
      address = '',
      secret = '',
    } = this.state.keypair || {}

    return (
      <Modal
        ref={this.modal}
        title='Create Keypair'
        textConfirm='Create'
        pending={this.state.pending && 'Creating...'}
        onConfirm={this.onConfirm}
        confirmDisabled={!this.state.name || !address}
        colorActions={['info']}
        textActions={['Regenerate']}
        onActions={[this.regenerateKeypair]}
      >
        <DebouncedFormGroup
          label='Name'
          maxLength='200'
          placeholder='Please enter a name for the keypair'
          onChange={name => this.setState({ name })}
        />
        <div className='row align-items-center'>
          <div className='col-2'>
            <Badge pill color='info' className='ml-1'>Address</Badge>
          </div>
          <div className='col-10 pl-0'>
            <code className='user-select small'>{address}</code>
          </div>
        </div>
        <div className='row align-items-center'>
          <div className='col-2'>
            <Badge pill color='success' className='ml-1'>{this.props.secretName}</Badge>
          </div>
          <div className='col-10 pl-0'>
            <code className='user-select small'>{secret}</code>
          </div>
        </div>
      </Modal>
    )
  }
}
