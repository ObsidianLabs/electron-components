import React from 'react'

import fileOps from '@obsidians/file-ops'

export default function ProjectPath ({ projectRoot }) {
  return (
    <kbd>
      <span
        key={`open-${projectRoot}`}
        className='hover-inline mr-1'
        style={{ display: 'inline-block', width: '1rem' }}
        onClick={() => fileOps.current.openItem(projectRoot)}
      >
        <i className='fas fa-folder-open hover-show' />
        <i className='fas fa-folder hover-hide' />
      </span>
      {projectRoot}
    </kbd>
  )
}