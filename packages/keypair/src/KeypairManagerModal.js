import React, { PureComponent } from 'react'

import {
  Modal,
  ButtonOptions,
  Table,
  Badge,
  IconButton,
  DeleteButton,
  UncontrolledTooltip,
} from '@obsidians/ui-components'

import notification from '@obsidians/notification'

import { utils } from '@obsidians/sdk'
import keypairManager from './keypairManager'

import RevealSecretModal from './RevealSecretModal'
import CreateKeypairModal from './CreateKeypairModal'
import ImportKeypairModal from './ImportKeypairModal'
import KeypairNameModal from './KeypairNameModal'
import { t } from '@obsidians/i18n'

export default class KeypairManagerModal extends PureComponent {
  static defaultProps = {
    title: t('keypair.manager'),
    warning: true,
    head: [t('abi.name'), t('abi.address'), t('explorer.page.balance')],
    actions: true,
    textActions: [t('keypair.create'), t('keypair.import')],
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
      chain: '',
      loading: false,
      keypairs: [],
      keypairFilter: null,
      showPrivateKeys: false,
      delBtnStatus: true,
    }
  }

  openModal = chain => {
    this.modal.current.openModal()
    if (chain) {
      this.setChain(chain)
    }
    this.refresh()
  }

  componentDidMount () {
    this.listenKeypairChange = keypairManager.onUpdated(keypairs => {
      this.setState({ keypairs })
    })
  }

  componentWillUnmount(){
    this.listenKeypairChange && this.listenKeypairChange()
  }

  async refresh () {
    this.setState({ loading: true, delBtnStatus: true })
    const keypairs = await keypairManager.loadAllKeypairs()
    this.setState({ keypairs, loading: false })
  }

  setChain = chain => {
    this.setState({ chain })
    if (!chain) {
      this.setState({ keypairFilter: null })
    } else {
      const filter = this.props.chains.find(c => c.key === chain)?.filter
      if (filter) {
        this.setState({ keypairFilter: filter })
      }
    }
  }

  createKeypair = async () => {
    const { keypairText } = this.props
    const success = await this.createKeypairModal.current.openModal(this.state.chain)
    if (success) {
      notification.success(
        t('keypair.createSuccess', {text: keypairText}),
        t('keypair.createSuccessText', {text: keypairText.toLowerCase(), projectName: process.env.PROJECT_NAME})
      )
      await this.refresh()
    }
  }

  importKeypair = async () => {
    const { keypairText } = this.props
    const success = await this.importKeypairModal.current.openModal(this.state.chain)
    if (success) {
      notification.success(
        t('keypair.importedSuccess', {text: keypairText}),
        t('keypair.importedSuccessText', {text: keypairText.toLowerCase(), projectName: process.env.PROJECT_NAME})
      )
      await this.refresh()
    }
  }

  deleteKey = async keypair => {
    this.setState({ delBtnStatus: false })
    const { keypairText } = this.props
    await keypairManager.deleteKeypair(keypair)
    notification.info(
      t('keypair.deleteSuccess', {text: keypairText}),
      t('keypair.deleteSuccessText', {text: keypairText.toLowerCase(), projectName: process.env.PROJECT_NAME})
    )
    this.refresh()
  }

  revealSecret = keypair => {
    this.revealSecretModal.current.openModal(keypair)
  }

  renderChainOptions () {
    const { chains } = this.props
    const { chain } = this.state

    if (!chains) {
      return null
    }
    return (
      <div>
        <ButtonOptions
          size='sm'
          className='mb-2'
          options={[...chains, { key: '', text: 'All' }]}
          selected={chain}
          onSelect={chain => this.setChain(chain)}
        />
      </div>
    )
  }

  renderKeypairTable = () => {
    let { loading, keypairs, keypairFilter, chain } = this.state
    if (loading) {
      return (
        <tr key='keys-loading' >
          <td align='middle' colSpan={3}>
            <i className='fas fa-pulse fa-spinner mr-1' />{t('loading')}...
          </td>
        </tr>
      )
    }
    if (keypairs && keypairFilter) {
      keypairs = keypairs.filter(k => keypairFilter(k.address))
    }
    if (!keypairs || !keypairs.length) {
      const { keypairText } = this.props
      let chainName
      if (chain) {
        chainName = this.props.chains.find(c => c.key === chain)?.text
      }
      let placeholder = `No ${keypairText.toLowerCase()}s`
      if (chainName) {
        placeholder += ` for ${chainName.toLowerCase()}`
      }
      return <tr key='keys-none' ><td align='middle' colSpan={3}>({placeholder})</td></tr>
    }
    return keypairs.map(this.renderKeypairRow)
  }

  editName = async keypair => {
    await this.keypairNameModal.current.openModal(keypair)
    this.refresh()
  }

  renderKeypairRow = keypair => {
    // 过滤地址中包含的不合法字符（禁止出现在 html attr 中的字符）
    // filter the illegal address
    const validAddress = keypair?.address?.replaceAll(/[^-_a-zA-Z0-9]/g, '-')
    const { networkManager } = require('@obsidians/network')
    // get short address length
    let address = utils.formatAddress(keypair.address, networkManager?.network?.chainId) || keypair.address
    const maxAddressLength = 42 // normal eth length
    if (address.length > maxAddressLength) {
      address = utils.abbreviateAddress(address)
    }
    return (
      <tr key={`key-${validAddress}`} className='hover-flex'>
        <td>
          <div className='d-flex' id={`tooltip-${validAddress}`}>
            <span className='text-truncate'>
              {keypair.name ? keypair.name : <span className='text-muted'>(None)</span>}
            </span>
              <UncontrolledTooltip
                  target={`tooltip-${validAddress}`}
              >
                <p>{keypair.name}</p>
              </UncontrolledTooltip>
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
            <code className='small'>{address}</code>
            <span className='text-transparent'>.</span>
            <DeleteButton
              color='primary'
              className='ml-1 hover-show'
              icon='far fa-eye'
              textConfirm={`Click again to reveal ${this.props.secretName.toLowerCase()}`}
              onConfirm={() => this.revealSecret(keypair)}
            />
          </div>
        </td>
        <td>
          <Badge pill color='success' className='ml-1'>{keypair.balance} {networkManager?.symbol}</Badge>
        </td>
        <td align='right'>
        {
          !this.props.deletionDisabled && this.state.delBtnStatus &&
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
      mnemonic,
      actions,
      textActions,
      RevealSecretModal,
      CreateKeypairModal,
      ImportKeypairModal,
    } = this.props

    let warningComponent = null
    if (warning) {
      warningComponent = (
        <div className='d-flex flex-row align-items-center mb-3'>
          <div className='h4 m-0 mr-3'><i className='fas fa-exclamation-triangle text-warning' /></div>
          <div>
            <div><b>{t('keypair.donot')} {t('keypair.warn')}</b></div>
            <div className='small text-muted'>
              {t('keypair.description')}
            </div>
          </div>
        </div>
      )
    }

    return <>
      <Modal
        size='lg'
        ref={this.modal}
        title={title}
        textActions={actions ? textActions : []}
        textCancel={t('component.text.close')}
        onActions={[this.createKeypair, this.importKeypair]}
      >
        {warningComponent}
        {this.renderChainOptions()}
        <Table
          tableSm
          TableHead={(
            <tr>
              <th style={{ width: '15%' }}>{head[0]}</th>
              <th style={{ width: '50%' }}>{head[1]}</th>
              <th style={{ width: '30%' }}>{head[2]}</th>
              <th></th>
            </tr>
          )}
        >
          {this.renderKeypairTable()}
        </Table>
      </Modal>
      <CreateKeypairModal
        ref={this.createKeypairModal}
        kp={keypairManager.kp}
        chains={chains}
        mnemonic={mnemonic}
        secretName={this.props.secretName}
        keypairs={this.state.keypairs}
      />
      <ImportKeypairModal
        ref={this.importKeypairModal}
        kp={keypairManager.kp}
        chains={chains}
        secretName={this.props.secretName}
        keypairs={this.state.keypairs}
      />
      <RevealSecretModal
        ref={this.revealSecretModal}
        kp={keypairManager.kp}
        secretName={this.props.secretName}
      />
      <KeypairNameModal ref={this.keypairNameModal} />
    </>
  }
}