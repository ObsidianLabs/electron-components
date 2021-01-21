import React, { PureComponent } from 'react'

import {
  DropdownInput,
  Badge,
} from '@obsidians/ui-components'

import keypairManager from './keypairManager'

export default class KeypairInputSelector extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      keypairs: [],
    }
  }

  componentDidMount () {
    keypairManager.loadAllKeypairs().then(this.updateKeypairs)
    keypairManager.onUpdated(this.updateKeypairs)
  }

  componentDidUpdate (prevProps) {
    if (prevProps.filter !== this.props.filter) {
      this.updateKeypairs(this.allKeypairs || [])
    }
  }

  updateKeypairs = allKeypairs => {
    this.allKeypairs = allKeypairs
    const keypairs = this.props.filter ? allKeypairs.filter(this.props.filter) : allKeypairs
    if (!this.props.editable) {
      if (!this.state.keypairs.length && keypairs.length) {
        this.props.onChange(keypairs[0].address)
      }
      if (this.state.keypairs.length && !keypairs.length) {
        this.props.onChange()
      }
      if (keypairs.length && !keypairs.find(k => k.address === this.props.value)) {
        this.props.onChange(keypairs[0].address)
      }
    }
    this.setState({ keypairs })
  }

  renderDisplay = key => {
    return (highlight, active) => {
      let address = key.address
      if (!active) {
        address = []
        key.address.split(highlight).forEach(part => {
          address.push(part)
          address.push(<b className='text-primary'>{highlight}</b>)
        })
        address.pop()
      }
      return (
        <div className='w-100 d-flex align-items-center justify-content-between'>
          <code className='text-overflow-dots mr-1'>{address}</code>
          <Badge color='info' style={{ top: 0 }}>{key.name}</Badge>
        </div>
      )
    }
  }

  render () {
    const {
      size,
      label,
      placeholder = '(No keypairs)',
      editable,
      maxLength,
      icon = 'fas fa-key',
      noCaret,
      value,
      onChange,
      invalid,
    } = this.props

    return (
      <DropdownInput
        size={size}
        label={label}
        placeholder={placeholder}
        editable={editable}
        maxLength={maxLength}
        inputClassName={value ? 'code' : ''}
        addon={<span key={`key-icon-${icon.replace(/\s/g, '-')}`}><i className={icon} /></span>}
        noCaret={typeof noCaret === 'boolean' ? noCaret : size === 'sm'}
        options={this.state.keypairs.map(k => ({
          id: k.address,
          badge: k.name,
          display: this.renderDisplay(k)
        }))}
        renderText={!editable && (option => <code>{option?.id}</code>)}
        value={value}
        onChange={onChange}
        invalid={invalid}
      />
    )
  }
}
