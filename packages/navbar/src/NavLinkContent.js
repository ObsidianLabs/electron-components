import React from 'react'
import NetworkIconUrl from './NetworkIcon'

export default function (props) {
  const { title, selected, icon, Icon, iconUrl, id, width, noneIcon = 'fas fa-file-times' } = props
  let key = 'icon'
  if (icon) {
    key = `icon-${icon.replace(/\s/, '-')}`
  }

  const iconClassName = 'nav-link-icon'
  let subtitle, iconComponent
  if (Icon) {
    iconComponent = <span key='icon' className={iconClassName}>{Icon}</span>
    subtitle = selected
  } else if (!selected) {
    iconComponent = <span key='no-selected' className={iconClassName}><i className={`w-100 h-100 ${noneIcon}`} /></span>
    subtitle = '(None)'
  } else {
    if (title == 'Network' && id) {
      iconComponent = <span className={iconClassName}><img src={NetworkIconUrl[(iconUrl? iconUrl : id.toLowerCase())]} className='w-100 h-100' /></span>
    } else {
      iconComponent = <span key={key} className={iconClassName}><i className={`w-100 h-100 ${icon}`} /></span>
    }
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
