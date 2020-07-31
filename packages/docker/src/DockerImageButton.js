import React, { PureComponent } from 'react'
import moment from 'moment'

import {
  Button,
  Badge,
  Modal,
  DeleteButton,
} from '@obsidians/ui-components'

import DownloadImageButton from './DownloadImageButton'
import { IpcChannel } from '@obsidians/ipc'

export default class DockerImageButton extends PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      loading: false,
      installed: [],
    }

    this.modal = React.createRef()
    this.channel = new IpcChannel(`docker-image-${this.props.imageName}`)
  }

  componentDidMount () {
    this.refreshVersions()
  }

  refreshVersions = async () => {
    this.setState({ loading: true })
    const versions = await this.channel.invoke('versions')
    this.setState({
      installed: versions,
      loading: false,
    })
  }

  deleteVersion = async version => {
    this.setState({ loading: true })
    await this.channel.invoke('deleteVersion', version)
    await this.refreshVersions()
  }

  onClickButton = () => {
    this.modal.current.openModal()
  }

  renderTableBody = () => {
    if (this.state.loading) {
      return (
        <tr key='loading'>
          <td align='middle' colSpan={4}>
            <i className='fas fa-spin fa-spinner mr-1' />Loading...
          </td>
        </tr>
      )
    }

    if (!this.state.installed.length) {
      const none = `(No ${this.props.noneName || this.props.imageName} installed)`
      return (
        <tr>
          <td align='middle' colSpan={4}>{none}</td>
        </tr>
      )
    }

    return (
      this.state.installed.map(v => (
        <tr key={`table-row-${v.Tag}`} className='hover-block'>
          <td>{v.Tag}</td>
          <td>{moment(v.CreatedAt, 'YYYY-MM-DD HH:mm:ss Z').format('LL')}</td>
          <td>{v.Size}</td>
          <td align='right'>
            <DeleteButton
              onConfirm={() => this.deleteVersion(v.Tag)}
              textConfirm='Click again to uninstall'
            />
          </td>
        </tr>
      ))
    )
  }

  render () {
    const imageName = this.props.imageName
    const {
      title = imageName,
      modalTitle = `${imageName} Manager`,
      downloadingTitle = `Downloading ${imageName}`
    } = this.props

    const nInstalled = this.state.installed.length

    return (
      <React.Fragment>
        <Button onClick={this.onClickButton}>
          <i className='fas fa-server mr-1' />
          {title}
          {
            nInstalled
              ? <Badge pill color='info' className='ml-1'>{nInstalled}</Badge>
              : null
          }
        </Button>
        <Modal
          ref={this.modal}
          title={modalTitle}
          ActionBtn={
            <DownloadImageButton
              color='success'
              imageName={imageName}
              channel={this.channel}
              downloadingTitle={downloadingTitle}
              onDownloaded={this.refreshVersions}
            />
          }
        >
          <table className='table table-sm table-hover table-striped'>
            <thead>
              <tr>
                <th style={{ width: '40%' }}>version</th>
                <th style={{ width: '35%' }}>created</th>
                <th style={{ width: '15%' }}>size</th>
                <th style={{ width: '10%' }} />
              </tr>
            </thead>
            <tbody>
              {this.renderTableBody()}
            </tbody>
          </table>
        </Modal>
      </React.Fragment>
    )
  }
}
