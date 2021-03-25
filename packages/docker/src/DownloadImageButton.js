import React, { PureComponent } from 'react'

import {
  Modal,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  UncontrolledButtonDropdown
} from '@obsidians/ui-components'
import { t } from '@obsidians/i18n'

import Terminal from '@obsidians/terminal'

import DockerImageChannel from './DockerImageChannel'

export default class DownloadImageButton extends PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      loading: false,
      versions: [],
      downloadVersion: '',
    }
    this.modal = React.createRef()
  }

  get channel () {
    return this.props.channel || new DockerImageChannel(this.props.imageName)
  }

  componentDidMount () {
    this.fetchRemoteVersions()
  }

  fetchRemoteVersions = async () => {
    this.setState({ loading: true })
    let versions
    try {
      versions = await this.channel.remoteVersions()
    } catch (e) {
      this.setState({ loading: false })
      console.warn(e)
      return
    }

    this.setState({ loading: false, versions })
  }

  onSelectVersion = downloadVersion => {
    this.setState({ downloadVersion })
    this.modal.current.openModal()
  }

  onDownloaded = ({ code }) => {
    if (code) {
      return
    }
    this.modal.current.closeModal()
    this.props.onDownloaded()
  }

  renderVersions = () => {
    const { loading, versions } = this.state
    if (loading) {
      return (
        <DropdownItem key='icon-loading-versions'>
          <i className='fas fa-spin fa-spinner mr-1' />{t('loading')}
        </DropdownItem>
      )
    }

    if (!versions.length) {
      return <DropdownItem disabled>({t('docker.image.none')})</DropdownItem>
    }

    return versions.map(({ name }) => (
      <DropdownItem key={name} onClick={() => this.onSelectVersion(name)}>{name}</DropdownItem>
    ))
  }

  render () {
    const imageName = this.channel.imageName
    const {
      installDropdownHeader = t('docker.image.availableVersions'),
      downloadingTitle = t('docker.image.downloading', { name: imageName }),
      size,
      color = 'secondary',
      right,
    } = this.props

    const logId = `terminal-docker-${imageName}`

    const title = (
      <div key='icon-downloading'>
        <i className='fas fa-spinner fa-spin mr-2' />{downloadingTitle} {this.state.downloadVersion}...
      </div>
    )
    return <>
      <UncontrolledButtonDropdown size={size}>
        <DropdownToggle
          caret
          color={color}
          onClick={() => this.fetchRemoteVersions()}
        >
          <i className='fas fa-download mr-1' />{t('docker.install')}
        </DropdownToggle>
        <DropdownMenu right={right}>
          <DropdownItem header>{installDropdownHeader}</DropdownItem>
          {this.renderVersions()}
        </DropdownMenu>
      </UncontrolledButtonDropdown>
      <Modal
        ref={this.modal}
        title={title}
      >
        <div className='rounded overflow-hidden'>
          <Terminal
            active
            logId={logId}
            height='300px'
            cmd={`docker pull ${imageName}:${this.state.downloadVersion}`}
            onFinished={this.onDownloaded}
          />
        </div>
      </Modal>
    </>
  }
}
