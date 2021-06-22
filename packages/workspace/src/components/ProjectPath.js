import React from 'react'

import platform from '@obsidians/platform'
import fileOps from '@obsidians/file-ops'
import notification from '@obsidians/notification'

let ProjectPath

if (platform.isDesktop) {
  ProjectPath = ({ projectRoot }) => {
    const openProjectRoot = async () => {
      try {
        await fileOps.current.openItem(projectRoot)
      } catch (e) {
        notification.error('Failed', e.message)
      }
    }
    return (
      <kbd>
        <span
          key={`open-${projectRoot}`}
          className='d-inline-block hover-inline w-3 mr-1'
          onClick={openProjectRoot}
        >
          <i className='fas fa-folder-open hover-inline-show' />
          <i className='fas fa-folder hover-inline-hide' />
        </span>
        {projectRoot}
      </kbd>
    )
  }
} else {
  ProjectPath = ({ projectRoot }) => {
    return (
      <kbd>
        <span className='d-inline-block mr-1'>
          <i className='fas fa-cloud' />
        </span>
        {projectRoot}
      </kbd>
    )
  }
}

export default ProjectPath