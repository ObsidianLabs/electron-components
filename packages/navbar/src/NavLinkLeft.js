import React, { PureComponent } from 'react'

import { withRouter } from 'react-router'
import { NavLink } from 'react-router-dom'

import NavLinkContent from './NavLinkContent'
import NavDropdown from './NavDropdown'

class NavLinkLeft extends PureComponent {
  static defaultProps = {
    onClickItem: () => {},
  }

  onToggle = event => {
    const { route, selected, history, location } = this.props
    const url = `/${route}/${selected.id || ''}`
    const match = location.pathname.startsWith(url)
    if (!match) {
      history.push(url)
    }
    return !match
  }

  onClickItem = item => {
    if (item.onClick) {
      item.onClick()
    } else {
      const { route, history } = this.props
      this.props.onClickItem(item.id)
      history.push(`/${route}/${item.id || ''}`)
    }
  }

  render () {
    const { route, title, selected, dropdown, icon } = this.props

    return (
      <NavLink
        to={`/${route}/${selected.id || ''}`}
        className='nav-link d-flex p-0'
        style={{ width: 273 }}
        activeClassName='active'
      >
        <NavDropdown
          route={route}
          selected={selected.id || ''}
          list={dropdown}
          onToggle={this.onToggle}
          onClickItem={this.onClickItem}
          icon={icon}
        >
          <NavLinkContent
            title={title}
            selected={selected.name}
            icon={icon}
            width='100%'
          />
        </NavDropdown>
      </NavLink>
    )
  }
}

export default withRouter(NavLinkLeft)
