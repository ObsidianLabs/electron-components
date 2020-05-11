import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'

export default class NavItemMenuItem extends PureComponent {
  static propTypes = {
    title: PropTypes.string.isRequired,
    selected: PropTypes.string.isRequired,
  }

  render () {
    const { title, selected, icon, Icon, width } = this.props

    const iconClassName = 'nav-link-icon'
    let subtitle, iconComponent
    if (Icon) {
      iconComponent = <span key='icon' className={iconClassName}>{Icon}</span>
      subtitle = selected
    } else if (!selected) {
      iconComponent = <span key='no-selected' className={iconClassName}><i className='w-100 h-100 fas fa-file-times' /></span>
      subtitle = '(None)'
    } else {
      iconComponent = <span key='selected' className={iconClassName}><i className={`w-100 h-100 fas ${icon}`} /></span>
      subtitle = selected
    }

    return (
      <div className='nav-link-content'>
        {iconComponent}
        <div className='small pr-2 overflow-hidden'>
          <div className='small text-white-50'>{title}</div>
          <div className='text-light text-overflow-dots' style={{ width }}>{subtitle}</div>
        </div>
      </div>
    )
  }
}
