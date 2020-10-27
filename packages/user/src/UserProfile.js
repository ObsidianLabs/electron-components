import React, { PureComponent } from 'react'

import {
  Media,
  Button,
  IconButton,
} from '@obsidians/ui-components'

import platform from '@obsidians/platform'

export default class UserProfile extends PureComponent {
  renderAvatar = () => {
    const { profile } = this.props

    if (profile?.avatar) {
      return (
        <Media
          object
          src={profile.avatar}
          className='rounded-circle'
          style={{ width: 100, height: 100 }}
        />
      )
    }
    return (
      <Media
        middle
        key='no-user'
        className='d-flex align-items-center justify-content-center rounded-circle bg-secondary text-muted'
        style={{ width: 100, height: 100 }}
      >
        <i className='fas fa-user-alt fa-3x' />
      </Media>
    )
  }

  renderUserInfo = () => {
    const { profile } = this.props

    if (!profile) {
      return <>
        <Media heading className='text-muted'>
          (not logged in)
        </Media>
        <p className='break-line'>Log in to synchronize your projects on the cloud.</p>
        <p className='break-line'>{this.renderLoginButton()}</p>
      </>
    }

    const { username, desc } = profile
    return <>
      <Media heading className='d-flex align-items-end'>
        {username}
        <IconButton
          color='default'
          className='ml-1 text-muted'
          icon='fas fa-pencil-alt'
          onClick={() => {}}
        />
      </Media>
      <p className='break-line'>{this.renderDescription(desc)}</p>
    </>
  }

  renderLoginButton = () => {
    return (
      <Button
        color='primary'
        size='sm'
        onClick={() => {}}
      >
        <i key='sign-in' className='fas fa-sign-in mr-2' />Log in
      </Button>
    )
  }

  renderDescription = desc => {
    if (desc) {
      return desc
    }
    return <span className='text-muted'>(No description)</span>
  }

  render () {
    if (platform.isDesktop) {
      return null
    }

    return (
      <Media className='overflow-hidden mb-4'>
        <Media left className='mr-4'>
          {this.renderAvatar()}
        </Media>
        <Media body>
          {this.renderUserInfo()}
        </Media>
      </Media>
    )
  }
}