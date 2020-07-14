import React, { PureComponent } from 'react'

import {
  Modal,
  IconButton,
  DeleteButton,
} from '@obsidians/ui-components'

import notification from '@obsidians/notification'

import keypairManager from './keypairManager'

import CreateKeypairModal from './CreateKeypairModal'
import ImportKeypairModal from './ImportKeypairModal'
import RevealSecretModal from './RevealSecretModal'
import KeypairNameModal from './KeypairNameModal'

export default class KeypairManagerModal extends PureComponent {
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
    const { name, keypair } = await this.createKeypairModal.current.openModal()
    if (name && keypair) {
      await keypairManager.saveKeypair(name, keypair)
      notification.success(
        'Create Keypair Successful',
        `A new keypair is created and saved in ${process.env.PROJECT_NAME}.`
      )
      await this.refresh()
    }
  }

  importKeypair = async () => {
    const { name, keypair } = await this.importKeypairModal.current.openModal()
    if (name && keypair) {
      await keypairManager.saveKeypair(name, keypair)
      notification.success(
        'Import Keypair Successful',
        `The keypair is imported to ${process.env.PROJECT_NAME}.`
      )
      await this.refresh()
    }
  }

  deleteKey = async keypair => {
    await keypairManager.deleteKeypair(keypair)
    notification.info(
      'Delete Keypair Successful',
      `The keypair is removed from ${process.env.PROJECT_NAME}.`
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
      return (
        <tr key='keys-none' >
          <td align='middle' colSpan={3}>
            (No keypairs)
          </td>
        </tr>
      )
    }
    return this.state.keypairs.map(this.renderKeypairRow)
  }

  editName = async keypair => {
    const newName = await this.keypairNameModal.current.openModal(keypair.name)
    if (newName) {
      keypairManager.updateKeypairName(keypair.address, newName)
      this.refresh()
    }
  }

  renderKeypairRow = keypair => {
    return (
      <tr key={`key-${keypair.address}`} className='hover-flex'>
        <td>
          <div className='d-flex'>
            {keypair.name ? keypair.name : <span className='text-muted'>(None)</span>}
            <IconButton
              color='transparent'
              className='ml-2 text-muted hover-show'
              onClick={() => this.editName(keypair)}
              icon='fas fa-pencil-alt'
            />
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
          <DeleteButton
            className='hover-show'
            onConfirm={() => this.deleteKey(keypair)}
          />
        </td>
      </tr>
    )
  }

  render () {
    return (
      <React.Fragment>
        <Modal
          ref={this.modal}
          title='Keypair Manager'
          textActions={['Create', 'Import']}
          textCancel='Close'
          onActions={[this.createKeypair, this.importKeypair]}
        >
          <div className='d-flex flex-row align-items-center mb-2'>
            <div className='h4 m-0 mr-3'><i className='fas fa-exclamation-triangle text-warning' /></div>
            <div>
              <div><b>DO NOT</b> use on mainnet! For development purpose only.</div>
              <div className='small text-muted'>
                For convenience in development, the private keys are saved unencrypted.
              </div>
            </div>
          </div>
          <table className='table table-sm table-hover table-striped'>
            <thead>
              <tr>
                <th style={{ width: '20%' }}>Name</th>
                <th style={{ width: '60%' }}>Address</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {this.renderKeypairTable()}
            </tbody>
          </table>
        </Modal>
        <CreateKeypairModal ref={this.createKeypairModal} secretName={this.props.secretName} />
        <ImportKeypairModal ref={this.importKeypairModal} secretName={this.props.secretName} />
        <RevealSecretModal ref={this.revealSecretModal} secretName={this.props.secretName}/>
        <KeypairNameModal ref={this.keypairNameModal} />
      </React.Fragment>
    )
  }
}