import Immutable, { List } from 'immutable'

export default {
  default: Immutable.fromJS({
    dev: {},
  }),
  persist: true,
  actions: {
    ADD_TRANSACTION: {
      reducer: (state, { payload }) => state.updateIn([payload.network, 'txs'], (txs = List()) => {
        return txs.unshift(Immutable.fromJS(payload.tx))
      })
    },
  }
}