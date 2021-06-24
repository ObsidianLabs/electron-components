import React, { Component } from 'react'
import classnames from 'classnames'

import {
  ButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from 'reactstrap'

import { withRouter } from 'react-router'

import fileOps from '@obsidians/file-ops'
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
        className='d-flex bg-secondary align-items-center justify-content-center user-avatar text-light'
      >
        <i className='fa fa-user-alt' />
      </div>
    )
  }

  renderExtraLoggedInOptions = () => {
    if (!this.props.extraLoggedInOptions) {
      return null
    }

    return this.props.extraLoggedInOptions.map((option, index) => {
      if (option.divider) {
        return <DropdownItem key={`extra-loggedin-option-${index}`} divider />
      }
      return (
        <DropdownItem key={`extra-loggedin-option-${index}`} onClick={option.onClick}>
          {option.icon && <i className={classnames(option.icon, 'w-3 mr-2')} />}
          {option.text}
        </DropdownItem>
      )
    })
  }

  renderDropdownMenus = profile => {
    let dropdownItems = []

    const {
      ENABLE_AUTH,
      PROJECT_NAME,
      PROJECT_WEB_URL,
      PROJECT_DESKTOP_URL,
      PROJECT_GITHUB_REPO,
    } = process.env

    let linkToOtherPlatformItem = []
    if (platform.isDesktop) {
      if (PROJECT_WEB_URL) {
        linkToOtherPlatformItem = [
          <DropdownItem key='divider2' divider />,
          <DropdownItem key='project-web-url' onClick={() => fileOps.current.openLink(PROJECT_WEB_URL)}>
            <i className='fad fa-browser w-3 mr-2' />{PROJECT_NAME} Web
          </DropdownItem>
        ]
      }
    } else if (PROJECT_DESKTOP_URL) {
      linkToOtherPlatformItem = [
        <DropdownItem key='divider2' divider />,
        <DropdownItem key='project-desktop-url' onClick={() => fileOps.current.openLink(`${PROJECT_DESKTOP_URL}/${platform.os}`)}>
          <i className='fas fa-download w-3 mr-2' />Desktop App
        </DropdownItem>
      ]
    }
    if (PROJECT_GITHUB_REPO) {
      linkToOtherPlatformItem.push(
        <DropdownItem key='github-repo' onClick={() => fileOps.current.openLink(PROJECT_GITHUB_REPO)}>
          <i className='fab fa-github w-3 mr-2' />GitHub Repo
        </DropdownItem>
      )
    }

    const username = profile.get('username')
    if (platform.isDesktop && !ENABLE_AUTH) {
      dropdownItems = [
        <DropdownItem key='my-projects' onClick={() => this.props.history.push(`/local`)}>
          <i className='fas fa-th-list w-3 mr-2' />My Projects		
        </DropdownItem>,
        ...linkToOtherPlatformItem,
      ]
    } else if (username) {
      dropdownItems = [
        <DropdownItem key='header' header>Logged in as</DropdownItem>,
        <DropdownItem key='sign-user' onClick={() => this.props.history.push(`/${username}`)}>
          <i className='fas fa-user w-3 mr-2' />
          {username}
        </DropdownItem>,
        this.renderExtraLoggedInOptions(),
        ...linkToOtherPlatformItem,
        <DropdownItem key='divider' divider />,
        <DropdownItem key='sign-out' onClick={() => Auth.logout(this.props.history)}>
          <i className='fas fa-sign-out w-3 mr-2' />Log out
        </DropdownItem>,
      ]
    } else {
      dropdownItems = [
        ...this.renderLoginButton(),
        <DropdownItem key='divider' divider />,
        <DropdownItem key='my-projects' onClick={() => this.props.history.push(`/local`)}>
          <i className='fas fa-th-list w-3 mr-2' />My Projects
        </DropdownItem>,
        this.renderExtraLoggedInOptions(),
        ...linkToOtherPlatformItem,
      ]
    }

    const isDropdownOpen = this.state.isDropdownOpen
    return (
      <div
        className={classnames('dropdown-menu dropdown-menu-right', isDropdownOpen && 'show')}
        style={{ right: 3, top: 48, width: 'fit-content' }}
      >
        {dropdownItems}
      </div>
    )
  }

  renderLoginButton = () => {
    const providers = process.env.LOGIN_PROVIDERS ? process.env.LOGIN_PROVIDERS.split(',') : ['github']
    return providers.map(provider => (
      <DropdownItem
        key={`login-${provider}`}
        onClick={() => Auth.login(this.props.history, provider)}
      >
        <i className='fas fa-sign-in w-3 mr-2' />{ providers.length > 1 ? `Login ${provider}` : 'Login' }
      </DropdownItem>
    ))
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
