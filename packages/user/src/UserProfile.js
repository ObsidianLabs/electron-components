import React, { PureComponent } from 'react'

import {
  Media,
  Button,
  IconButton,
} from '@obsidians/ui-components'

import platform from '@obsidians/platform'

export default class UserProfile extends PureComponent {
  renderAvatar = avatar => {
    if (avatar) {
      return (
        <Media
          object
          src={avatar}
          className='rounded-circle'
          style={{ width: 100, height: 100 }}
        />
      )
    }
    return (
      <Media
        middle
        className='d-flex align-items-center justify-content-center rounded-circle bg-secondary text-muted'
        style={{ width: 100, height: 100 }}
      >
        <i className='fas fa-user-alt fa-3x' />
      </Media>
    )
  }

  renderUserInfo = profile => {
    const username = profile.get('username')
    const desc = profile.get('desc')

    if (!username) {
      return <>
        <Media heading className='text-muted'>
          (not logged in)
        </Media>
        <p className='break-line'>Log in to synchronize your projects on the cloud.</p>
        <p className='break-line'>{this.renderLoginButton()}</p>
      </>
    }
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

    const profile = this.props.profile
    
    return (
      <Media className='overflow-hidden mb-4'>
        <Media left className='mr-4'>
          {this.renderAvatar(profile.get('avatar'))}
        </Media>
        <Media body>
          {this.renderUserInfo(profile)}
        </Media>
      </Media>
    )
  }
}