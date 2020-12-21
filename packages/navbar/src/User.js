import React, { Component } from 'react'
import classnames from 'classnames'

import {
  ButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from 'reactstrap'

import { withRouter } from 'react-router'

import platform from '@obsidians/platform'
import Auth from '@obsidians/auth'

class User extends Component {
  state = {
    isDropdownOpen: false,
  }

  onToggle = event => {
    event.preventDefault()
    this.setState({ isDropdownOpen: !this.state.isDropdownOpen })
  }

  renderAvatar = avatar => {
    if (avatar) {
      return (
        <div
          key='with-avatar'
          className='d-flex bg-secondary align-items-center justify-content-center user-avatar'
        >
          <img className='user-avatar' src={avatar}/>
        </div>
      )
    }
    return (
      <div
        key='no-avatar'
        className='d-flex bg-secondary align-items-center justify-content-center user-avatar'
      >
        <i className='fa fa-user-alt' />
      </div>
    )
  }

  renderExtraLoggedInOptions = () => {
    if (!this.props.extraLoggedInOptions) {
      return null
    }

    return this.props.extraLoggedInOptions.map((option, index) => (
      <DropdownItem key={`extra-loggedin-option-${index}`} onClick={option.onClick}>
        {option.icon && <i className={classnames(option.icon, 'w-3 mr-2')} />}
        {option.text}
      </DropdownItem>
    ))
  }

  renderDropdownMenus = profile => {
    if (platform.isDesktop) {
      return (
        <DropdownMenu right>
          <DropdownItem key='my-projects' onClick={() => this.props.history.push(`/local`)}>
            <i className='fas fa-th-list w-3 mr-2' />My Projects
          </DropdownItem>
        </DropdownMenu>
      )
    }

    const username = profile.get('username')

    if (username) {
      return (
        <DropdownMenu right>
          <DropdownItem header>Logged in as</DropdownItem>
          <DropdownItem key='sign-user' onClick={() => this.props.history.push(`/${username}`)}>
            <i className='fas fa-user w-3 mr-2' />
            {username}
          </DropdownItem>
          {this.renderExtraLoggedInOptions()}
          <DropdownItem divider />
          <DropdownItem key='sign-out' onClick={() => Auth.logout(this.props.history)}>
            <i className='fas fa-sign-out w-3 mr-2' />Log out
          </DropdownItem>
        </DropdownMenu>
      )
    }

    return (
      <DropdownMenu right>
        <DropdownItem key='login' onClick={() => Auth.login()}>
          <i className='fas fa-sign-in w-3 mr-2' />Login
        </DropdownItem>
        <DropdownItem divider />
        <DropdownItem key='my-projects' onClick={() => this.props.history.push(`/local`)}>
          <i className='fas fa-th-list w-3 mr-2' />My Projects
        </DropdownItem>
      </DropdownMenu>
    )
  }

  render () {
    const { profile } = this.props

    return (
      <ButtonDropdown
        group={false}
        className='d-flex flex-1 w-100'
        isOpen={this.state.isDropdownOpen}
        toggle={this.onToggle}
        onClick={event => event.preventDefault()}
      >
        <DropdownToggle tag='div' className='nav-dropdown-toggle px-2'>
          {this.renderAvatar(profile.get('avatar'))}
        </DropdownToggle>
        {this.renderDropdownMenus(profile)}
      </ButtonDropdown>
    )
  }
}

export default withRouter(User)
