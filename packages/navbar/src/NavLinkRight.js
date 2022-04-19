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

  render () {
    const { route, title, selected, icon, noneIcon, network } = this.props
    let { dropdown, customNetworks } = this.props
    if (title == 'Network') {
      const isCustomNetworkIndex = dropdown.findIndex(item => item.id == 'custom')
      dropdown = dropdown.slice(0, isCustomNetworkIndex + 1)
      customNetworks = customNetworks.toJS()
      Object.keys(customNetworks).map((item) => {
        const customNetwork = {
          id: (item.replace(/\s+/g,'')).toLowerCase(),
          group: 'custom',
          name: item,
          icon: 'fas fa-vial',
          notification: `Switched to <b>${item}</b>.`,
          url: customNetworks[item]?.url,
          chainId: customNetworks[item]?.chainId,
          symbol: '',
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
          network={network}
          width='5.9rem'
        />
        <NavDropdown
          right
          route={route}
          selected={selected.id || ''}
          list={dropdown}
          onClickItem={this.onClickItem}
          icon={icon}
          customNetworks={customNetworks}
          network={network}
        />
      </NavLink>
    )
  }
}

export default connect(['network', 'customNetworks'])(withRouter(NavLinkRight))
// export default withRouter(NavLinkRight)
