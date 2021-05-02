import React, { PureComponent } from 'react'

import {
  Modal,
  Badge,
  DebouncedFormGroup,
  ButtonOptions,
} from '@obsidians/ui-components'

import notification from '@obsidians/notification'
import { kp } from '@obsidians/sdk'

import keypairManager from './keypairManager'

export default class CreateKeypairModal extends PureComponent {
  constructor (props) {
    super(props)
    const defaultChain = props.chains && props.chains[0]
    this.state = {
      chain: defaultChain,
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
    const keypair = await keypairManager.newKeypair(this.state.chain)
    this.setState({ keypair })
  }

  setChain = chain => {
    const secret = this.state.keypair?.secret
    const keypair = kp.importKeypair(secret, chain)
    this.setState({ chain, keypair })
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
    const { chains } = this.props
    const { chain } = this.state
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
        {
          chains &&
          <div>
            <ButtonOptions
              size='sm'
              className='mb-3'
              options={chains.map(c => ({ key: c, text: c }))}
              selected={chain}
              onSelect={chain => this.setChain(chain)}
            />
          </div>
        }
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
