import React, { PureComponent } from 'react'

import { withRouter } from 'react-router'
import { NavLink } from 'react-router-dom'

import NavLinkContent from './NavLinkContent'
import NavDropdown from './NavDropdown'

class NavLinkLeft extends PureComponent {
  static defaultProps = {
    onClickItem: () => { },
  }

  onToggle = event => {
    const { route, selected, history, location } = this.props
    let url = `/${route}`
    if (selected.id) {
      url = `/${route}/${selected.id}`
    }
    if (!route) url = '/local'
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
      const { history } = this.props
      this.props.onClickItem(item.id, item)
      history.push(`/${item.route}/${item.id || ''}`)
    }
  }

  render() {
    const { route, title, selected, dropdown, icon, contextMenu, disable } = this.props

    let url = `/${route}`
    if (selected.id) {
      url = `/${route}/${selected.id}`
    }
    if (!route) url = '/local'
    return (
      <NavLink
        to={url}
        exact={true}
        className='nav-link d-flex p-0'
        activeClassName='active'
      >
        <NavLinkContent
          title={title}
          selected={selected.name}
          icon={icon}
          width='12.4rem'
        />
        <NavDropdown
          route={route}
          selected={selected.id || ''}
          list={dropdown}
          onClickItem={this.onClickItem}
          left
          icon={icon}
          disable={disable}
          contextMenu={contextMenu}
        />
      </NavLink>
    )
  }
}

export default withRouter(NavLinkLeft)
