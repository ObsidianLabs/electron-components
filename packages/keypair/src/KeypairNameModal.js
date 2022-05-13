import React, { PureComponent } from 'react'

import {
  Modal,
  DebouncedFormGroup,
} from '@obsidians/ui-components'
import { t } from '@obsidians/i18n'

import keypairManager from './keypairManager'

export default class KeypairNameModal extends PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      saving: false,
      address: '',
      name: '',
    }

    this.modal = React.createRef()
    this.input = React.createRef()
  }
  

  openModal ({ address, name }) {
    this.modal.current.openModal()
    this.setState({ address, name })
    setTimeout(() => this.input.current.focus(), 100)
    return new Promise(resolve => this.onResolve = resolve)
  }

  onConfirm = async () => {
    const { address, name } = this.state

    this.setState({ saving: true })
    await keypairManager.updateKeypairName(address, name)
    this.setState({ saving: false })

    this.modal.current.closeModal()
    this.onResolve()
  }

  render () {
    return (
      <Modal
        ref={this.modal}
        title={t('keypair.modify')}
        textConfirm={t('keypair.save')}
        pending={this.state.saving && `${t('keypair.saving')}...`}
        onConfirm={this.onConfirm}
        confirmDisabled={!this.state.name}
      >
        <DebouncedFormGroup
          ref={this.input}
          label='Name'
          maxLength='200'
          placeholder={t('keypair.createPlaceholder')}
          value={this.state.name}
          onChange={name => this.setState({ name })}
        />
      </Modal>
    )
  }
}
