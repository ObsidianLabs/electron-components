import React, { Component } from 'react'

import {
  ButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from 'reactstrap'

import { withRouter } from 'react-router'

import { Auth } from '@obsidians/auth'
import redux from '@obsidians/redux'

class User extends Component {
  state = {
    isDropdownOpen: false,
    auth: new Auth()
  }

  onToggle = event => {
    event.preventDefault()
    this.setState({ isDropdownOpen: !this.state.isDropdownOpen })
  }

  renderAvatar = () => {
    const state = redux.getState()
    const avatar = state.auth.get('avatar')
    if (avatar) {
      return (
        <div
          key='with-avatar'
          className='d-flex bg-secondary align-items-center justify-content-center overflow-hidden'
          style={{ width: 32, height: 32, borderRadius: 16 }}
        >
          <img className='user-avatar' src={avatar}/>
        </div>
      )
    }
    return (
      <div
        key='no-avatar'
        className='d-flex bg-secondary align-items-center justify-content-center overflow-hidden'
        style={{ width: 32, height: 32, borderRadius: 16 }}
      >
        <i className='fa fa-user-alt' />
      </div>
    )
  }

  renderDropdownMenus = () => {
    return (
      <DropdownMenu right>
        <DropdownItem key='my-projects' onClick={() => this.props.history.push(`/guest`)}>
          <i className='fas fa-th-list mr-2' />
          My Projects
        </DropdownItem>
        <DropdownItem key='login' onClick={() => this.state.auth.login()}>
          <i className='fas fa-sign-in mr-2' />
          Login
        </DropdownItem>
      </DropdownMenu>
    )
  }

  render () {
    return (
      <ButtonDropdown
        group={false}
        className='d-flex flex-1 w-100'
        isOpen={this.state.isDropdownOpen}
        toggle={this.onToggle}
        onClick={event => event.preventDefault()}
      >
        <DropdownToggle tag='div' className='nav-dropdown-toggle px-2'>
          {this.renderAvatar()}
        </DropdownToggle>
        {this.renderDropdownMenus()}
      </ButtonDropdown>
    )
  }
}

export default withRouter(User)
