import React, { PureComponent } from 'react'

import { Modal } from '@obsidians/ui-components'
import { t } from '@obsidians/i18n'

import globalModalManager from './globalModalManager'

export default class AutoUpdateModal extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      version: ''
    }
    this.modal = React.createRef()
  }

  componentDidMount () {
    globalModalManager.autoUpdateModal = this
  }

  openModal = async (version) => {
    this.setState({ version })
    this.modal.current.openModal()
    return new Promise(resolve => { this.onConfirm = resolve })
  }

  confirm = () => {
    this.onConfirm && this.onConfirm(true)
    this.modal.current.closeModal()
  }

  onCancel = () => {
    this.onConfirm && this.onConfirm(false)
    return true
  }

  render () {
    return (
      <Modal
        ref={this.modal}
        title={t('global.update.available', { project: process.env.PROJECT_NAME, version: this.state.version })}
        textConfirm={t('global.update.confirm')}
        onConfirm={this.confirm}
        textCancel={t('global.update.cancel')}
        onCancel={this.onCancel}
      >
        {t('global.update.message')}
      </Modal>
    )
  }
}
