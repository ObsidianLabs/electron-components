import mixpanel from 'mixpanel-browser'
import mapValues from 'lodash/mapValues'
import platform from '@obsidians/platform'

let mixpanelInitialized
const track = store => next => action => {
  if (process.env.REACT_APP_MIXPANEL_TOKEN) {
    mixpanel.init(process.env.REACT_APP_MIXPANEL_TOKEN)
    mixpanelInitialized = true
  }
  if (!mixpanelInitialized) {
    return next(action)
  }
  
  const { type, payload } = action
  const project = process.env.PROJECT
  if (type === 'SET_VERSION') {
    if (platform.isDesktop) {
      const distinctId = store.getState().profile.get('distinctId') || mixpanel.get_distinct_id()
      mixpanel.identify(distinctId)
      payload.distinctId = distinctId
    }
    mixpanel.register({ project, version: payload.version, platform: platform.type })
    mixpanel.people.set({ project, version: payload.version, platform: platform.type })
  } else if (type === 'UPDATE_PROFILE') {
    const distinctId = `${payload.userId}:${project}`
    mixpanel.identify(distinctId)
    mixpanel.people.set({
      $name: payload.username,
      $avatar: payload.avatar,
    })
  } else if (type === 'CLEAR_USER_PROFILE') {
    mixpanel.reset()
  }
  if (!type.startsWith('persist/')) {
    mixpanel.track(`${project}/${type}`, typeof payload !== 'object' ? { value: payload } : payload)
  }

  return next(action)
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
