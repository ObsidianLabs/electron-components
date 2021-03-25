import React, { PureComponent } from 'react'

import {
  Modal,
  DebouncedFormGroup,
} from '@obsidians/ui-components'
import { t } from '@obsidians/i18n'

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
          feedback: `${t('keypair.address')}: ${keypair.address}`
        })
      } catch (e) {
        this.setState({ keypair: null, valid: false, feedback: t('keypair.error.notValid', { secret: this.props.secretName.toLowerCase() }) })
      }
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
        t('keypair.error.import'),
        t('keypair.error.duplicateName', { name })
      )
      return
    }

    if (this.props.keypairs.find(kp => kp.address === keypair.address)) {
      notification.error(
        t('keypair.error.import'),
        t('keypair.error.duplicateKey', { address: keypair.address })
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
        title={t('keypair.import.title')}
        textConfirm={t('keypair.import.confirm')}
        pending={this.state.pending && t('keypair.import.importing')}
        onConfirm={this.onConfirm}
        confirmDisabled={!name || !valid}
      >
        <DebouncedFormGroup
          label={t('keypair.input.name')}
          maxLength='200'
          placeholder={t('keypair.input.placeholder')}
          onChange={name => this.setState({ name })}
        />
        <DebouncedFormGroup
          label={t('keypair.import.label', { name: this.props.secretName.toLowerCase() })}
          maxLength='300'
          onChange={this.onChange}
          feedback={feedback}
          valid={valid}
        />
      </Modal>
    )
  }
}
