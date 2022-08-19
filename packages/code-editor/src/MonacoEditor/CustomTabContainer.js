import React, { forwardRef, useRef } from 'react'
import { LoadingScreen } from '@obsidians/ui-components'
import PropTypes from 'prop-types'

const CustomTabContainer = forwardRef(({ loading, modelSession, updateTabPath, updateProjectInfo }, ref) => {
  const markdownTab = useRef(null)

  if (ref) {
    ref.current = {
      syncEditStatus: () => {
        markdownTab.current.onEditButton(true, false)
      }
    }
  }

  if (!modelSession.CustomTab) return null
  if (loading) {
    return <div className='custom-tab bg2'><LoadingScreen /></div>
  }
  return <modelSession.CustomTab
    ref={markdownTab}
    modelSession={modelSession}
    updateTabPath={updateTabPath}
    updateProjectInfo={updateProjectInfo} />
})

CustomTabContainer.displayName = 'CustomTabContainer'
export default CustomTabContainer

CustomTabContainer.propTypes = {
  loading: PropTypes.string,
  modelSession: PropTypes.string,
  updateTabPath: PropTypes.func,
  updateProjectInfo: PropTypes.func

}
