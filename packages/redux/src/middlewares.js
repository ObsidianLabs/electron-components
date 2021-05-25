import mixpanel from 'mixpanel-browser'
import mapValues from 'lodash/mapValues'

const track = store => next => action => {
  const { type, payload } = action
  const project = process.env.PROJECT
  if (type === 'SET_VERSION') {
    if (process.env.REACT_APP_MIXPANEL_TOKEN) {
      mixpanel.init(process.env.REACT_APP_MIXPANEL_TOKEN)
      const distinctId = store.getState().profile.get('distinctId') || mixpanel.get_distinct_id()
      mixpanel.identify(distinctId)
      payload.distinctId = distinctId
      mixpanel.register({ project, version: payload.version })
      mixpanel.people.set({ project, version: payload.version })
    }
  }
  try {
    if (type.startsWith('persist/')) {
      throw new Error()
    }
    mixpanel.track(`${project}/${type}`, typeof payload !== 'object' ? { value: payload } : payload)
  } catch {}

  let result = next(action)
  return result
}

const middlewares = []
if (process.env.NODE_ENV === 'development') {
  const { createLogger } = require('redux-logger')
  middlewares.push(
    createLogger({
      collapsed: true,
      stateTransformer: state => mapValues(state, s => (s.toJS ? s.toJS() : s))
    })
  )
} else {
  middlewares.push(track)
}

export default middlewares
