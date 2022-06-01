import React, { forwardRef, useRef } from 'react'
import { LoadingScreen } from '@obsidians/ui-components'
import PropTypes from 'prop-types'

const CustomTabContainer = forwardRef(({ loading, modelSession, updateTabPath }, ref) => {
  const markdownTab = useRef(null)

  if (ref) {
    ref.current = {
      syncEditStatus: () => {
        markdownTab.current.onEditButton()
      }
    }
  }

  if (!modelSession.CustomTab) return null
  if (loading) {
    return <div className='custom-tab bg2'><LoadingScreen /></div>
  }
  return <modelSession.CustomTab
    ref={markdownTab}
    updateTabPath={updateTabPath}
    modelSession={modelSession} />
})

CustomTabContainer.displayName = 'CustomTabContainer'
export default CustomTabContainer

CustomTabContainer.propTypes = {
  loading: PropTypes.string,
  modelSession: PropTypes.string,
  updateTabPath: PropTypes.string
}
