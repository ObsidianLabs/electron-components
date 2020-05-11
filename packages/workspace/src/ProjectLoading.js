import React from 'react'
import {
  CenterScreen,
} from '@obsidians/ui-components'

export default function ({ projectRoot }) {
  return (
    <CenterScreen>
      <i className='fas fa-spin fa-spinner mr-2' />Loading Project <kbd>{projectRoot}</kbd>...
    </CenterScreen>
  )
}
