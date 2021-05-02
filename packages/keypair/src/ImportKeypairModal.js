import React, { PureComponent } from 'react'

import {
  Modal,
  DebouncedFormGroup,
  ButtonOptions,
} from '@obsidians/ui-components'

import notification from '@obsidians/notification'
import { kp } from '@obsidians/sdk'

import keypairManager from './keypairManager'

export default class ImportKeypairModal extends PureComponent {
  constructor (props) {
    super(props)
    const defaultChain = props.chains && props.chains[0]
    this.state = {
      chain: defaultChain,
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
      this.refreshKeypair(secret, this.state.chain)
    }
  }

  setChain = chain => {
    const secret = this.state.keypair?.secret
    this.refreshKeypair(secret, chain)
  }

  refreshKeypair = (secret, chain) => {
    try {
      const keypair = kp.importKeypair(secret, chain)
      this.setState({
        chain,
        keypair,
        valid: true,
        feedback: <span>Address: <code>{keypair.address}</code></span>
      })
    } catch (e) {
      this.setState({ chain, keypair: null, valid: false, feedback: `Not a valid ${this.props.secretName.toLowerCase()}` })
    }
  }

  onConfirm = async () => {
    const { name, keypair } = this.state

    if (!keypair) {
      this.onResolve()
      return
    }

    if (this.props.keypairs.find(kp => kp.name === name)) {
      notification.error(
        `Import Keypair Failed`,
        `The keypair name <b>${name}</b> has already been used.`
      )
      return
    }

    if (this.props.keypairs.find(kp => kp.address === keypair.address)) {
      notification.error(
        `Import Keypair Failed`,
        `Keypair for <b>${keypair.address}</b> already exists.`
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
    const {
      chain,
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
        <DebouncedFormGroup
          label={`Enter the ${this.props.secretName.toLowerCase()} you want to import`}
          maxLength='300'
          onChange={this.onChange}
          feedback={feedback}
          valid={valid}
        />
      </Modal>
    )
  }
}
