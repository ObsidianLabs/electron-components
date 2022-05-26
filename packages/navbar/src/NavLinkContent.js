import React from 'react'
import { t } from '@obsidians/i18n'

export default function (props) {
  const { title, selected, icon, Icon, logoIcon, width, noneIcon = 'fas fa-file-times' } = props
  let key = 'icon'
  if (icon) {
    key = `icon-${icon.replace(/\s/, '-')}`
  }

  const iconClassName = 'nav-link-icon'
  let subtitle, iconComponent, networkIcon
  if (Icon) {
    iconComponent = <span key='icon' className={iconClassName}>{Icon}</span>
    subtitle = selected
  } else if (!selected) {
    iconComponent = <span key='no-selected' className={iconClassName}><i className={`w-100 h-100 ${noneIcon}`} /></span>
    subtitle = `(${t('header.title.none')})`
  } else {
    const projectStudioName = process.env.PROJECT_NAME.replace(/\s+/g, '')
    if (projectStudioName == 'BlackIDE' && title == 'Network' && logoIcon) {
      networkIcon = <img src={logoIcon} className='w-100 h-100' />
    } else {
      networkIcon = <span key={key}><i className={`w-100 h-100 ${icon}`} /></span>
    }
    iconComponent = <span key={key} className={iconClassName}>{networkIcon}</span>
    subtitle = selected
  }

  return (
    <div className='nav-link-content'>
      {iconComponent}
      <div className='small pr-2 overflow-hidden'>
        <div className='small text-alpha-50'>{title}</div>
        <div className='text-overflow-dots' style={{ width }}>{subtitle}</div>
      </div>
    </div>
  )
}
