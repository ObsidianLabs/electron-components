import React from 'react'
import {
  Screen,
} from '@obsidians/ui-components'
import { t } from '@obsidians/i18n'

export default function ProjectInvalid ({ projectRoot, children }) {
  return (
    <Screen>
      <h4 className='display-4'>{t('workspace.error.projectNotFound')}</h4>
      <p className='lead'>{t('workspace.error.projectNotFoundDetail')} <kbd>{projectRoot}</kbd></p>
      { children && <hr /> }
      <span>{children}</span>
    </Screen>
  )
}
