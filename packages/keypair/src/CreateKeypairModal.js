import React, { PureComponent } from 'react'

import {
  Modal,
  Badge,
  DebouncedFormGroup,
} from '@obsidians/ui-components'
import { t } from '@obsidians/i18n'

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
        t('keypair.error.create'),
        t('keypair.error.duplicateName', { name })
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
        title={t('keypair.create.title')}
        textConfirm={t('keypair.create.confirm')}
        pending={this.state.pending && t('keypair.create.creating')}
        onConfirm={this.onConfirm}
        confirmDisabled={!this.state.name || !address}
        colorActions={['info']}
        textActions={[t('keypair.create.regenerate')]}
        onActions={[this.regenerateKeypair]}
      >
        <DebouncedFormGroup
          label={t('keypair.input.name')}
          maxLength='200'
          placeholder={t('keypair.input.placeholder')}
          onChange={name => this.setState({ name })}
        />
        <div className='row align-items-center'>
          <div className='col-2'>
            <Badge pill color='info' className='ml-1'>{t('keypair.address')}</Badge>
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
