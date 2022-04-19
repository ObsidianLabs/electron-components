import React, { PureComponent } from 'react'

import { withRouter } from 'react-router'
import { NavLink } from 'react-router-dom'
import redux, { connect } from '@obsidians/redux'

import NavLinkContent from './NavLinkContent'
import NavDropdown from './NavDropdown'

class NavLinkRight extends PureComponent {
  static defaultProps = {
    onClickItem: () => {},
  }

  onClickItem = item => {
    const { route, history } = this.props
    this.props.onClickItem(item.id, item)
    if (history.location.pathname.startsWith(`/${route}`)) {
      history.push(`/${route}/${item.id}`)
    }
  }

  render() {
    const { route, title, selected, icon, noneIcon } = this.props
    let { dropdown, customNetworks } = this.props
    if (title == 'Network' && customNetworks.toArray().length) {
      const customNetworkIndex = dropdown.findIndex(item => item.id == 'custom')
      dropdown = dropdown.slice(0, customNetworkIndex + 1)
      customNetworks = customNetworks.toArray()
      customNetworks.sort((a, b) => a[0].localeCompare(b[0]))
      customNetworks.map(([name, item]) => {
        const customNetwork = {
          id: (name.replace(/\s+/g, '')).toLowerCase(),
          group: 'custom',
          name: name,
          fullName: name,
          icon: 'fas fa-vial',
          notification: `Switched to <b>${name}</b>.`,
          url: item.toJS()?.url,
          chainId: item.toJS()?.chainId,
        }
        dropdown.push(customNetwork)
      })
    }

    return (
      <NavLink
        to={`/${route}/${selected.id || ''}`}
        className='nav-link d-flex p-0'
        activeClassName='active'
      >
        <NavLinkContent
          title={title}
          selected={selected.name}
          icon={icon}
          iconUrl={selected.iconUrl}
          id={selected.id}
          noneIcon={noneIcon}
          width='5.9rem'
        />
        <NavDropdown
          right
          route={route}
          selected={selected.id || ''}
          list={dropdown}
          onClickItem={this.onClickItem}
          icon={icon}
        />
      </NavLink>
    )
  }
}

export default connect(['customNetworks'])(withRouter(NavLinkRight))
