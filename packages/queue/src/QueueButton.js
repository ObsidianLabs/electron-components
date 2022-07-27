import React, { PureComponent } from 'react'

import {
  Modal,
  UncontrolledButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from '@obsidians/ui-components'
import { t } from '@obsidians/i18n'
import redux from '@obsidians/redux'

import BaseQueueManager from './BaseQueueManager'

export default class QueueButton extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      data: null,
      tx: {},
      explorerUrl: null,
    }
    BaseQueueManager.button = this

    this.txModal = React.createRef()
    this.allTxsModal = React.createRef()
  }

  openAllTransactionsModal = data => {
    this.allTxsModal.current.openModal()
  }

  openTransaction = tx => {
    this.setState({ tx })
    this.forceUpdate()
    this.txModal.current.openModal()
  }

  renderDropdownItems = (pending, txs, QueueItem) => {
    const { network: networkId } = redux.getState()
    const { networkManager } = require('@obsidians/network')
    const explorerUrl = networkManager.networks.find(item => networkId === item.id)?.explorerUrl
    this.setState({ explorerUrl })
    const pendingItems = pending.map((item, index) => (
      <DropdownItem key={`pending-${index}`} onClick={() => this.openTransaction(item)}>
        <QueueItem {...item} />
      </DropdownItem>
    ))
    if (pendingItems.length) {
      pendingItems.push(<DropdownItem divider key='divider-pending' />)
      pendingItems.unshift(
        <DropdownItem header key='header-pending'>
          <i className='fas fa-pulse fa-spinner mr-1' />Pending
        </DropdownItem>
      )
    }

    const txsItems = txs.map((item, index) => (
      <DropdownItem key={`tx-${index}`} onClick={() => this.openTransaction(item)}>
        <QueueItem {...item} />
      </DropdownItem>
    )).slice(0, 15)
    if (!txsItems.length) {
      txsItems.push(<DropdownItem disabled key='disable' >({t('header.title.none')})</DropdownItem>)
    }
    // txsItems.push(<DropdownItem divider />)
    txsItems.unshift(
      <DropdownItem header key='header-txs'>
        <i className='far fa-history mr-1' />{t('header.title.recent')}
      </DropdownItem>
    )

    const allTransactions = (
      <DropdownItem onClick={this.openAllTransactionsModal}>
        <div className='d-inline-block w-3'><i className='fal fa-clipboard-list-check' /></div>
        All Transactions...
      </DropdownItem>
    )

    return [...pendingItems, ...txsItems]
  }

  openBlockExplorer = () => {
    const fileOps = require('@obsidians/file-ops')
    const { explorerUrl, tx } = this.state
    explorerUrl && fileOps.default?.current?.openLink(`${explorerUrl}/tx/${tx?.txHash}`)
    this.txModal.current.closeModal()
  }

  render () {
    let icon = null
    if (BaseQueueManager.pending.length) {
      icon = <div key='icon-pending' className='d-inline-block w-3 mr-1'><i className='fas fa-pulse fa-spinner' /></div>
    } else {
      icon = <div key='icon-no-pending' className='d-inline-block w-3 mr-1'><i className='fas fa-receipt' /></div>
    }

    const { txs, QueueItem, TransactionDetails, ...otherProps } = this.props
    const { tx = {}, explorerUrl } = this.state
    const title = tx.data?.title || tx.data?.name
    const transferDetail = tx.data?.name === 'Transfer' && 'Transaction Detail'

    return <>
      <UncontrolledButtonDropdown direction='up'>
        <DropdownToggle size='sm' color='default' className='rounded-0 px-2 text-muted'>
          {icon}{t('explorer.transactions.transactions')}
        </DropdownToggle>
        <DropdownMenu className='dropdown-menu-sm'>
          {this.renderDropdownItems(BaseQueueManager.pending, txs?.toJS() || [], QueueItem)}
        </DropdownMenu>
      </UncontrolledButtonDropdown>
      <Modal
        ref={this.txModal}
        title={transferDetail || title || 'Transaction'}
        textCancel='Close'
        textConfirm={transferDetail && 'View More on Block Explorer'}
        onConfirm={transferDetail && this.openBlockExplorer}
      >
        <TransactionDetails
          {...otherProps}
          tx={tx}
          explorerUrl={explorerUrl}
          transferType={transferDetail ? 'generalTransfer' : 'contractTransfer'}
          closeModal={() => this.txModal.current.closeModal()}
        />
      </Modal>
      <Modal
        ref={this.allTxsModal}
        title='All Transactions'
      >
      </Modal>
    </>
  }
}
