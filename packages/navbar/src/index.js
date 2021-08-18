import React, { PureComponent } from 'react'

import {
  Navbar,
  Nav
} from '@obsidians/ui-components'

import { NavLink } from 'react-router-dom'

import NavLinkLeft from './NavLinkLeft'
import NavLinkRight from './NavLinkRight'

import User from './User'

import NavDropdownContextMenu from './NavDropdownContextMenu'

import './styles.scss'

export default class Header extends PureComponent {
  renderLeftNavbar = links => {
    return links.map(link => (
      <NavLinkLeft
        key={`nav-link-${link.route}`}
        route={link.route}
        title={link.title}
        icon={link.icon}
        selected={link.selected}
        dropdown={link.dropdown}
        onClickItem={link.onClickItem}
      />
    ))
  }

  renderRightNavbar = links => {
    return links.map(link => (
      <NavLinkRight
        key={`nav-link-${link.route}`}
        route={link.route}
        title={link.title}
        icon={link.icon}
        noneIcon={link.noneIcon}
        selected={link.selected}
        dropdown={link.dropdown}
        onClickItem={link.onClickItem}
      />
    ))
  }

  renderContextMenu = links => {
    return links.map(link => {
      return link.dropdown.map((item, index) => {
        if (!item.id || !link.contextMenu) {
          return null
        }
        const contextMenu = link.contextMenu(item.id)
        if (!contextMenu) {
          return null
        }
        return (
          <NavDropdownContextMenu
            key={`nav-context-menu-${link.route}-${item.id}-${index}`}
            route={link.route}
            item={item}
            contextMenu={contextMenu}
          />
        )
      })
    }).flat().filter(Boolean)
  }

  render () {
    const { profile, navbarLeft, navbarRight, extraLoggedInOptions, children } = this.props
    const username = profile.get('username') || 'local'

    return (
      <Navbar tag='header' dark expand>
        <Nav navbar className='navbar-left'>
          {this.renderLeftNavbar(navbarLeft)}
        </Nav>
        {children}
        <Nav navbar className='ml-auto navbar-nav-scroll navbar-right'>
          {this.renderRightNavbar(navbarRight)}
          <NavLink
            to={`/${username}`}
            exact
            className='nav-link d-flex p-0'
            activeClassName='active'
          >
            <User profile={profile} extraLoggedInOptions={extraLoggedInOptions} />
          </NavLink>
        </Nav>
        {this.renderContextMenu(navbarLeft)}
        {this.renderContextMenu(navbarRight)}
      </Navbar>
    )
  }
}
