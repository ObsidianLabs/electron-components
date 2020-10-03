import React, { PureComponent } from 'react'

import {
  DropdownInput,
  Badge,
} from '@obsidians/ui-components'

import DockerImageManager from './DockerImageManager'

export default class DockerImageInputSelector extends PureComponent {
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
    if (!this.props.disableAutoSelection && !this.props.selected && versions.length) {
      this.props.onSelected(versions[0].Tag)
    }
    this.setState({
      loading: false,
      versions: versions.map(v => ({ id: v.Tag, display: v.Tag })),
    })
  }

  openManager = () => {
    this.modal.current.openModal()
  }

  renderText = (option, selected) => {
    if (this.state.loading) {
      return null
    }
    if (this.state.versions.length && !selected) {
      return <Badge color='danger' style={{ top: 0 }} className='mr-1'>not selected</Badge>
    } else if (!option) {
      return <Badge color='danger' style={{ top: 0 }} className='mr-1'>not installed</Badge>
    }
    return null
  }

  render () {
    let { versions } = this.state

    let placeholder = `Select a version of ${this.props.noneName || this.imageName}`
    if (!versions.length) {
      placeholder = `(No ${this.props.noneName || this.imageName} installed)`
      versions.push({ id: 'none', display: placeholder, disabled: true })
    }

    return <>
      <DropdownInput
        label={this.props.label || this.imageName}
        options={[
          {
            group: <><i className='fas fa-download mr-1' />installed</>,
            children: this.state.versions,
          },
          {
            id: 'manager',
            display: <span key='manager'><i className='fas fa-cog mr-1' />{this.props.modalTitle}...</span>,
            onClick: this.openManager,
          }
        ]}
        disableAutoSelection={this.props.disableAutoSelection}
        inputClassName={this.props.inputClassName}
        placeholder={placeholder}
        renderText={this.renderText}
        value={this.props.selected?.toString() || ''}
        onChange={this.props.onSelected}
      />
      <DockerImageManager
        ref={this.modal}
        {...this.props}
        onRefresh={this.onRefreshVersions}
      />
    </>
  }
}
