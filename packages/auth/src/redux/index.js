import { Map } from 'immutable'

export default {
  default: Map({}),
  persist: true,
  actions: {
    UPDATE_PROFILE: {
      reducer: (state, { payload }) => state.merge(payload)
    },
    CLEAR_USER_PROFILE: {
      reducer: () => Map({})
    },
  }
}
