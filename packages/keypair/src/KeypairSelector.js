import React, { PureComponent } from 'react'
import classnames from 'classnames'

import {
  DropdownInput,
  Badge,
} from '@obsidians/ui-components'

import keypairManager from './keypairManager'

export default class KeypairSelector extends PureComponent {
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

  updateKeypairs = keypairs => {
    if (!this.props.editable) {
      if (!this.state.keypairs.length && keypairs.length) {
        this.props.onChange(keypairs[0].address)
      }
      if (this.state.keypairs.length && !keypairs.length) {
        this.props.onChange()
      }
    }
    this.setState({ keypairs })
  }

  render () {
    const {
      size,
      label,
      placeholder = '(No keypairs)',
      editable,
      maxLength,
      icon = 'fas fa-key',
      value,
      onChange,
    } = this.props

    return (
      <DropdownInput
        size={size}
        label={label}
        placeholder={placeholder}
        editable={editable}
        maxLength={maxLength}
        noCaret={size === 'sm'}
        inputClassName={value ? 'code' : ''}
        addon={<span key={`key-icon-${icon.replace(/\s/g, '-')}`}><i className={icon} /></span>}
        options={this.state.keypairs.map(k => ({
          id: k.address,
          badge: (
            <div
              className={classnames('d-flex align-items-center', size !== 'sm' && 'mr-1')}
              style={size === 'sm' ? { fontSize: '0.875rem' } : null}
            >
              <Badge color='info' style={{ top: 0 }}>{k.name}</Badge>
            </div>
          ),
          display: (
            <div className='w-100 d-flex align-items-center justify-content-between'>
              <code className='text-overflow-dots mr-1'>{k.address}</code><Badge color='info' style={{ top: 0 }}>{k.name}</Badge>
            </div>
          )
        }))}
        renderText={option => option.badge}
        value={value}
        onChange={onChange}
      />
    )
  }
}
