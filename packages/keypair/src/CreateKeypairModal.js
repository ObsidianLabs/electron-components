import React, { PureComponent } from 'react'

import {
  Modal,
  Badge,
  DebouncedFormGroup,
  Label,
  ButtonOptions,
  ButtonGroup,
  Button,
  UncontrolledButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from '@obsidians/ui-components'

import notification from '@obsidians/notification'
import { t } from '@obsidians/i18n'

import keypairManager from './keypairManager'

export default class CreateKeypairModal extends PureComponent {
  constructor (props) {
    super(props)
    const defaultChain = props.chains && props.chains[0].key
    this.state = {
      pending: false,
      name: '',
      chain: defaultChain,
      secretType: 'privkey',
      keypair: null,
    }

    this.modal = React.createRef()
    this.input = React.createRef()
  }

  openModal (chain) {
    this.modal.current.openModal()
    if (chain) {
      this.setState({ chain }, this.regenerateKeypair)
    } else {
      this.regenerateKeypair()
    }
    setTimeout(() => this.input.current?.focus(), 100)
    return new Promise(resolve => this.onResolve = resolve)
  }

  regenerateKeypair = async () => {
    const keypair = await keypairManager.newKeypair(this.props.kp, this.state.chain, this.state.secretType)
    this.setState({ keypair })
  }

  setChain = chain => {
    const secret = this.state.keypair?.secret
    const keypair = this.props.kp.importKeypair(secret, chain)
    this.setState({ chain, keypair })
  }

  onConfirm = async () => {
    const { name, keypair } = this.state

    if (!keypair) {
      this.onResolve()
      return
    }

    if (this.props.keypairs.find(k => k.name === name)) {
      notification.error(
        t('keypair.fail'),
        t('keypair.failText', {name})
      )
      return
    }

    this.setState({ pending: true })
    await keypairManager.saveKeypair(name, keypair)
    this.setState({ pending: false })

    this.modal.current.closeModal()
    this.onResolve(true)
  }

  renderChainOptions = () => {
    const { chains } = this.props
    const { chain } = this.state

    if (!chains) {
      return null
    }
    return <>
      <Label>{t('keypair.used')}</Label>
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

  renderRegenerateBtn = () => {
    if (this.props.mnemonic) {
      return (
        <ButtonGroup>
          <Button color='success' onClick={this.regenerateKeypair}>{t('keypair.regenerate')}</Button>
          <UncontrolledButtonDropdown>
            <DropdownToggle color='success' className='pr-2 pl-1' caret />
            <DropdownMenu>
              <DropdownItem onClick={() => this.setState({ secretType: 'privkey' }, this.regenerateKeypair)}>
                {t('keypair.fromPrivateKey')}
              </DropdownItem>
              <DropdownItem onClick={() => this.setState({ secretType: 'mnemonic' }, this.regenerateKeypair)}>
                {t('keypair.fromMnemonic')}
              </DropdownItem>
            </DropdownMenu>
          </UncontrolledButtonDropdown>
        </ButtonGroup>
      )
    } else {
      return <Button color='success' onClick={this.regenerateKeypair}>{t('keypair.regenerate')}</Button>
    }
  }

  render () {
    const {
      address = '',
      secret = '',
      secretName = this.props.mnemonic ? '' : this.props.secretName,
    } = this.state.keypair || {}

    return (
      <Modal
        ref={this.modal}
        title={`${t('keypair.create')} ${t('keypair.keypair')}`}
        textConfirm={t('keypair.create')}
        pending={this.state.pending && `${t('keypair.creating')}...`}
        onConfirm={this.onConfirm}
        confirmDisabled={!this.state.name || !address}
        colorActions={['info']}
        ActionBtn={this.renderRegenerateBtn()}
      >
        <DebouncedFormGroup
          ref={this.input}
          label='Name'
          maxLength='200'
          placeholder={t('keypair.createPlaceholder')}
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
            <Badge pill color='success' className='ml-1'>{secretName}</Badge>
          </div>
          <div className='col-10 pl-0'>
            <code className='user-select small'>{secret}</code>
          </div>
        </div>
      </Modal>
    )
  }
}
