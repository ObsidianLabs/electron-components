import Immutable from 'immutable'

export default {
  default: Immutable.fromJS({}),
  persist: true,
  actions: {
    UPDATE_PROFILE: {
      reducer: (state, { payload }) => {
        const { token, username, avatar } = payload
        return Immutable.fromJS({ token, username, avatar })
      }
    },
  }
}