import React from 'react'
import {
  Screen,
} from '@obsidians/ui-components'

export default function ProjectInvalid ({ projectRoot, children }) {
  return (
    <Screen>
      <h4 className='display-4'>项目未找到</h4>
      <p className='lead'>无法找到此项目 <kbd>{projectRoot}</kbd></p>
      { children && <hr /> }
      <span>{children}</span>
    </Screen>
  )
}
