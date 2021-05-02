import React, { PureComponent } from 'react'

import {
  Modal,
  IconButton,
  DeleteButton,
  Table,
} from '@obsidians/ui-components'

import notification from '@obsidians/notification'

import keypairManager from './keypairManager'

import RevealSecretModal from './RevealSecretModal'
import CreateKeypairModal from './CreateKeypairModal'
import ImportKeypairModal from './ImportKeypairModal'
import KeypairNameModal from './KeypairNameModal'

export default class KeypairManagerModal extends PureComponent {
  static defaultProps = {
    title: 'Keypair Manager',
    warning: true,
    head: ['Name', 'Address'],
    actions: true,
    textActions: ['Create', 'Import'],
    keypairText: 'Keypair',
    RevealSecretModal,
    CreateKeypairModal,
    ImportKeypairModal,
  }

  constructor (props) {
    super(props)

    this.modal = React.createRef()
    this.createKeypairModal = React.createRef()
    this.importKeypairModal = React.createRef()
    this.revealSecretModal = React.createRef()
    this.keypairNameModal = React.createRef()

    this.state = {
      loading: false,
      keypairs: [],
      showPrivateKeys: false,
    }
  }

  openModal = () => {
    this.modal.current.openModal()
    this.refresh()
  }

  async refresh () {
    this.setState({ loading: true })
    const keypairs = await keypairManager.loadAllKeypairs()
    this.setState({ keypairs, loading: false })
  }

  createKeypair = async () => {
    const { keypairText } = this.props
    const success = await this.createKeypairModal.current.openModal()
    if (success) {
      notification.success(
        `Create ${keypairText} Successful`,
        `A new ${keypairText.toLowerCase()} is created and saved in ${process.env.PROJECT_NAME}.`
      )
      await this.refresh()
    }
  }

  importKeypair = async () => {
    const { keypairText } = this.props
    const success = await this.importKeypairModal.current.openModal()
    if (success) {
      notification.success(
        `Import ${keypairText} Successful`,
        `The ${keypairText.toLowerCase()} is imported to ${process.env.PROJECT_NAME}.`
      )
      await this.refresh()
    }
  }

  deleteKey = async keypair => {
    const { keypairText } = this.props
    await keypairManager.deleteKeypair(keypair)
    notification.info(
      `Delete ${keypairText} Successful`,
      `The ${keypairText.toLowerCase()} is removed from ${process.env.PROJECT_NAME}.`
    )
    this.refresh()
  }

  revealSecret = keypair => {
    this.revealSecretModal.current.openModal(keypair)
  }

  renderKeypairTable = () => {
    if (this.state.loading) {
      return (
        <tr key='keys-loading' >
          <td align='middle' colSpan={3}>
            <i className='fas fa-spin fa-spinner mr-1' />Loading...
          </td>
        </tr>
      )
    }
    if (!this.state.keypairs || !this.state.keypairs.length) {
      const { keypairText } = this.props
      return (
        <tr key='keys-none' >
          <td align='middle' colSpan={3}>
            (No {`${keypairText.toLowerCase()}s`})
          </td>
        </tr>
      )
    }
    return this.state.keypairs.map(this.renderKeypairRow)
  }

  editName = async keypair => {
    await this.keypairNameModal.current.openModal(keypair)
    this.refresh()
  }

  renderKeypairRow = keypair => {
    return (
      <tr key={`key-${keypair.address}`} className='hover-flex'>
        <td>
          <div className='d-flex'>
            {keypair.name ? keypair.name : <span className='text-muted'>(None)</span>}
            {
              !this.props.modifyNameDisabled &&
              <IconButton
                color='transparent'
                className='ml-2 text-muted hover-show'
                onClick={() => this.editName(keypair)}
                icon='fas fa-pencil-alt'
              />
            }
          </div>
        </td>
        <td>
          <div className='d-flex align-items-center'>
            <code className='small'>{keypair.address}</code>
            <span className='text-transparent'>.</span>
            <DeleteButton
              color='primary'
              className='ml-1 hover-show'
              icon='far fa-eye'
              textConfirm={`Reveal ${this.props.secretName.toLowerCase()}`}
              onConfirm={() => this.revealSecret(keypair)}
            />
          </div>
        </td>
        <td align='right'>
        {
          !this.props.deletionDisabled &&
          <DeleteButton
            className='hover-show'
            onConfirm={() => this.deleteKey(keypair)}
          />
        }
        </td>
      </tr>
    )
  }

  render () {
    const {
      title,
      warning,
      head,
      chains,
      actions,
      textActions,
      RevealSecretModal,
      CreateKeypairModal,
      ImportKeypairModal,
    } = this.props

    let warningComponent = null
    if (warning) {
      warningComponent = (
        <div className='d-flex flex-row align-items-center mb-2'>
          <div className='h4 m-0 mr-3'><i className='fas fa-exclamation-triangle text-warning' /></div>
          <div>
            <div><b>DO NOT</b> use on mainnet! For development purpose only.</div>
            <div className='small text-muted'>
              For convenience in development, the private keys are saved unencrypted.
            </div>
          </div>
        </div>
      )
    }

    return <>
      <Modal
        ref={this.modal}
        title={title}
        textActions={actions ? textActions : []}
        textCancel='Close'
        onActions={[this.createKeypair, this.importKeypair]}
      >
        {warningComponent}
        <Table
          tableSm
          TableHead={(
            <tr>
              <th style={{ width: '20%' }}>{head[0]}</th>
              <th style={{ width: '60%' }}>{head[1]}</th>
              <th></th>
            </tr>
          )}
        >
          {this.renderKeypairTable()}
        </Table>
      </Modal>
      <CreateKeypairModal ref={this.createKeypairModal} chains={chains} secretName={this.props.secretName} keypairs={this.state.keypairs} />
      <ImportKeypairModal ref={this.importKeypairModal} chains={chains} secretName={this.props.secretName} keypairs={this.state.keypairs} />
      <RevealSecretModal ref={this.revealSecretModal} secretName={this.props.secretName}/>
      <KeypairNameModal ref={this.keypairNameModal} />
    </>
  }
}