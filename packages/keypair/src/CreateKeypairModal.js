import React, { PureComponent } from 'react'

import {
  Modal,
  Badge,
  DebouncedFormGroup,
} from '@obsidians/ui-components'

import keypairManager from './keypairManager'

export default class CreateKeypairModal extends PureComponent {
  constructor (props) {
    super(props)

    this.state = {
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
      this.onResolve({})
      return
    }

    this.modal.current.closeModal()
    this.onResolve({ name, keypair })
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
        textConfirm='Save'
        onConfirm={this.onConfirm}
        confirmDisabled={!this.state.name || !address}
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
