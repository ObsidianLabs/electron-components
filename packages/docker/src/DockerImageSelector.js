import React, { PureComponent } from 'react'

import {
  UncontrolledButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from '@obsidians/ui-components'
import { t } from '@obsidians/i18n'

import platform from '@obsidians/platform'

import DockerImageManager from './DockerImageManager'

export default class DockerImageSelector extends PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      loading: true,
      versions: [],
    }

    this.modal = React.createRef()
  }

  get imageName() {
    return this.props.channel?.imageName || this.props.imageName
  }

  onRefreshVersions = versions => {
    if (!versions.length) {
      this.props.onSelected('')
    } else if (!this.props.disableAutoSelection && !this.props.selected) {
      this.props.onSelected(versions[0].Tag)
    }
    this.setState({ loading: false, versions })
  }

  openManager = () => {
    this.modal.current.openModal()
  }

  renderItems = () => {
    if (this.state.loading) {
      return (
        <DropdownItem key='images-loading' disabled><i className='fas fa-spin fa-spinner mr-1' />{t('loading')}</DropdownItem>
      )
    }

    if (!this.state.versions.length) {
      const none = t('docker.image.noInstall', { name: this.props.noneName || this.imageName })
      return (
        <DropdownItem key='images-none' disabled>{none}</DropdownItem>
      )
    }

    const versions = [...this.state.versions]
    return versions.map(v => (
      <DropdownItem
        key={`image-version-${v.Tag}`}
        active={this.props.selected === v.Tag}
        onClick={() => this.props.onSelected(v.Tag)}
      >
        {v.Tag}
      </DropdownItem>
    ))
  }

  renderManagerItem = () => {
    if (platform.isWeb) {
      return null
    }
    return <>
      <DropdownItem divider />
        <DropdownItem onClick={this.openManager}>
          <i className='fas fa-cog mr-1' />
          {this.props.modalTitle}...
        </DropdownItem>
    </>
  }

  render () {
    let {
      HeaderDockerItems,
      children,
    } = this.props

    if (!HeaderDockerItems) {
      if (platform.isDesktop) {
        HeaderDockerItems = <><i className='far fa-desktop mr-2' />{t('docker.installed')}</>
      } else {
        HeaderDockerItems = <><i className='fas fa-code-merge mr-1' />{t('docker.image.versions')}</>
      }
    }

    let icon = null
    if (this.props.icon) {
      icon = <span key='icon' className='mr-1'><i className={this.props.icon} /></span>
    }
    return <>
      <UncontrolledButtonDropdown direction='up'>
        <DropdownToggle
          size='sm'
          color='default'
          className='rounded-0 text-muted px-2 text-nowrap overflow-hidden text-overflow-dots'
          style={{ maxWidth: 240 }}
        >
          {icon}
          {this.props.title || this.imageName} ({this.props.selected?.toString() || t('docker.image.none')})
        </DropdownToggle>
        <DropdownMenu right className={this.props.size === 'sm' && 'dropdown-menu-sm'}>
          {children}
          <DropdownItem header>
            {HeaderDockerItems}
          </DropdownItem>
          {this.renderItems()}
          {this.renderManagerItem()}
        </DropdownMenu>
      </UncontrolledButtonDropdown>
      <DockerImageManager
        ref={this.modal}
        {...this.props}
        onRefresh={this.onRefreshVersions}
      />
    </>
  }
}
