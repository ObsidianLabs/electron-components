import redux from '@obsidians/redux'

import moment from 'moment'

export default class BaseQueueManager {
  static button = null
  static pending = []

  addToQueue (item) {
    BaseQueueManager.pending.unshift(item)
    BaseQueueManager.button.forceUpdate()
  }

  updateStatus (txHash, status, extraData, callbacks) {
    const index = BaseQueueManager.pending.findIndex(item => item.txHash === txHash)
    if (index === -1) {
      return
    }

    let tx
    if (status !== 'CONFIRMED' && status !== 'FAILED') {
      tx = BaseQueueManager.pending[index]
      tx.status = status
      tx.ts = moment().unix()
      tx.data = { ...tx.data, ...extraData }
    } else {
      tx = BaseQueueManager.pending.splice(index, 1)[0]
      tx.status = status
      tx.ts = moment().unix()
      tx.data = { ...tx.data, ...extraData }

      const { network } = redux.getState()
      redux.dispatch('ADD_TRANSACTION', { network, tx })
    }

    BaseQueueManager.button.forceUpdate()
    this.onStatus(status.toLowerCase(), tx, callbacks)
  }

  onStatus (status, tx, callbacks) {
    if (callbacks && callbacks[status]) {
      const openModal = callbacks[status](tx.data)
      if (openModal) {
        BaseQueueManager.button.openTransaction(tx)
      }
    }
  }

  async process (pendingTransaction, txHash, data, callbacks) {
    throw new Error('Queue.process is not implemented')
  }

  async add (sender, data, callbacks = {}) {
    const pendingTransaction = sender()

    const txHash = pendingTransaction.txHash || await pendingTransaction
    
    this.process(pendingTransaction, txHash, data, callbacks)
  }
}
