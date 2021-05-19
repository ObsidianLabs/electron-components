import React, { PureComponent } from 'react'

import {
  Modal,
  Badge,
  DebouncedFormGroup,
  Label,
  ButtonOptions,
} from '@obsidians/ui-components'

import notification from '@obsidians/notification'
import { kp } from '@obsidians/sdk'

import keypairManager from './keypairManager'

export default class CreateKeypairModal extends PureComponent {
  constructor (props) {
    super(props)
    const defaultChain = props.chains && props.chains[0].key
    this.state = {
      chain: defaultChain,
      pending: false,
      name: '',
      keypair: null,
    }

    this.modal = React.createRef()
  }

  openModal (chain) {
    this.modal.current.openModal()
    if (chain) {
      this.setState({ chain })
    }
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

  renderChainOptions () {
    const { chains } = this.props
    const { chain } = this.state

    if (!chains) {
      return null
    }
    return <>
      <Label>The keypair can be used on</Label>
      <div>
        <ButtonOptions
          size='sm'
          className='mb-3'
          options={chains}
          selected={chain}
          onSelect={chain => this.setChain(chain)}
        />
      </div>
    </>
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
        {this.renderChainOptions()}
        <Label>Keypair info</Label>
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
