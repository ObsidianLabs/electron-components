import React, { PureComponent } from 'react'

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
    if (!this.state.keypairs.length && keypairs.length) {
      this.props.onChange(keypairs[0].address)
    }
    if (this.state.keypairs.length && !keypairs.length) {
      this.props.onChange()
    }
    this.setState({ keypairs })
  }

  render () {
    return (
      <DropdownInput
        size={this.props.size}
        label={this.props.label}
        addon={<i className='fas fa-key' />}
        options={this.state.keypairs.map(k => ({
          id: k.address,
          display: (
            <div className='w-100 d-flex align-items-center justify-content-between'>
              <code className='text-overflow-dots mr-1'>{k.address}</code><Badge color='info' style={{ top: 0 }}>{k.name}</Badge>
            </div>
          )
        }))}
        renderText={option => <div className='w-100 mr-1'>{option.display}</div>}
        placeholder='(No keypairs)'
        value={this.props.value}
        onChange={this.props.onChange}
      />
    )
  }
}
