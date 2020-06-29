import { Map } from 'immutable'

export default {
  default: Map(),
  persist: true,
  actions: {
    UPDATE_KEYPAIR_NAME: {
      reducer: (state, { payload }) => {
        return state.set(payload.address, payload.name)
      }
    },
    REMOVE_KEYPAIR_NAME: {
      reducer: (state, { payload }) => {
        return state.remove(payload.address)
      }
    },
  }
}