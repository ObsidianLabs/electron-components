import React, { PureComponent } from 'react'

import {
  Modal,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  UncontrolledButtonDropdown
} from '@obsidians/ui-components'

import { IpcChannel } from '@obsidians/ipc'
import Terminal from '@obsidians/terminal'

export default class DownloadImageModal extends PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      loading: false,
      versions: [],
      downloadVersion: '',
    }
    this.modal = React.createRef()
    this.channel = this.props.channel || new IpcChannel(`docker-image-${this.props.imageName}`)
  }

  componentDidMount () {
    this.fetchRemoteVersions()
  }

  fetchRemoteVersions = async () => {
    this.setState({ loading: true })
    let versions
    try {
      versions = await this.channel.invoke('remoteVersions', 10)
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
          <i className='fas fa-spin fa-spinner mr-1' />Loading...
        </DropdownItem>
      )
    }

    if (!versions.length) {
      return <DropdownItem disabled>(None)</DropdownItem>
    }

    return versions.map(({ name }) => (
      <DropdownItem key={name} onClick={() => this.onSelectVersion(name)}>{name}</DropdownItem>
    ))
  }

  render () {
    const imageName = this.props.imageName
    const {
      installDropdownHeader = 'Available Versions',
      downloadingTitle = `Downloading ${imageName}`,
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
    return (
      <React.Fragment>
        <UncontrolledButtonDropdown size={size}>
          <DropdownToggle
            caret
            color={color}
            onClick={() => this.fetchRemoteVersions()}
          >
            <i className='fas fa-download mr-1' />Install
          </DropdownToggle>
          <DropdownMenu right={right}>
            <DropdownItem header className='small'>{installDropdownHeader}</DropdownItem>
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
      </React.Fragment>
    )
  }
}
