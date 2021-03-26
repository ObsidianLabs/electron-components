import React from 'react'
import {
  CenterScreen,
} from '@obsidians/ui-components'
import { t } from '@obsidians/i18n'

export default function ({ projectRoot }) {
  return (
    <CenterScreen>
      <i className='fas fa-spin fa-spinner mr-2' />{t('workspace.projectLoading')} <kbd>{projectRoot}</kbd>...
    </CenterScreen>
  )
}
