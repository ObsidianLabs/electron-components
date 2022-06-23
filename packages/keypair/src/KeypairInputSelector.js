import React, { PureComponent } from 'react'
import { DropdownInput, Badge } from '@obsidians/ui-components'
import notification from '@obsidians/notification'
import keypairManager from './keypairManager'
import { utils } from '@obsidians/sdk'

export default class KeypairInputSelector extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      keypairs: []
    }
    const { networkManager } = require('@obsidians/network')
    this.networkManager = networkManager

    this.abbriviFunc = this.abbriviFunc.bind(this)
  }

  componentDidMount() {
    keypairManager.loadAllKeypairs().then(this.updateKeypairs)
    this.listenKeypairChange = keypairManager.onUpdated(this.updateKeypairs)
  }

  componentWillUnmount() {
    this.listenKeypairChange && this.listenKeypairChange()
  }

  componentDidUpdate(prevProps) {
    if (prevProps.filter !== this.props.filter) {
      this.updateKeypairs(this.allKeypairs || [])
    }
  }

  updateKeypairs = allKeypairs => {
    this.allKeypairs = allKeypairs
    const keypairs = this.props.filter ? allKeypairs.filter(this.props.filter) : allKeypairs
    if (!this.props.editable) {
      if (this.state.keypairs.length && !keypairs.length) {
        this.props.onChange()
      }
      if (keypairs.length && !keypairs.find(k => k.address === this.props.value)) {
        this.props.onChange(keypairs[0].address)
      }
    }
    this.setState({ keypairs })
  }

  abbriviFunc(address) {
    return utils.isValidAddressReturn(address).substr(0, 6) + '...' + utils.isValidAddressReturn(address).substr(-6)
  }

  renderDisplay = key => {
    const { name } = key
    const abbreviationOption = this.props.abbreviationOption
    const address = utils.formatAddress(key.address, this.networkManager?.current?.chainId)
    return (highlight, active) => {
      let highlightAddress = address
      if (!active && highlight) {
        highlightAddress = []
        let reg = new RegExp(highlight, 'ig')
        let tempArr = address.replaceAll(reg, text => `,spc-${text},`)
        tempArr.split(',').forEach(part => {
          if (part === '') return
          if (part.indexOf('spc') !== -1) {
            let splitAddress = part.split('spc-')[1]
            splitAddress = abbreviationOption ? this.abbriviFunc(splitAddress) : splitAddress
            highlightAddress.push(<b className='text-primary'>{splitAddress}</b>)
          } else {
            highlightAddress.push(part)
          }
        })
      }

      if (abbreviationOption) {
        if (highlightAddress && typeof highlightAddress[0] === 'string') {
          const validValue = Array.isArray(highlightAddress) ? highlightAddress[0] : highlightAddress
          highlightAddress = this.abbriviFunc(validValue)
        }
      }

      return (
        <div className='w-100 d-flex align-items-center justify-content-between'>
          <code className='text-overflow-dots mr-1'>{highlightAddress}</code>
          <Badge color='info' style={{ top: 0 }}>{name}</Badge>
        </div>
      )
    }
  }

  mapKeyToOption = key => {
    return {
      id: key.address,
      badge: key.name,
      display: this.renderDisplay(key)
    }
  }

  render() {
    const {
      size,
      label,
      editable,
      maxLength,
      icon = 'fas fa-key',
      noCaret,
      value,
      onChange,
      extra = [],
      abbreviationOption = false,
      invalid
    } = this.props

    const options = this.state.keypairs.map(this.mapKeyToOption)
    const extraOptions = extra ? extra.map(item => {
      if (item.children) {
        return {
          ...item,
          children: item.children.map(this.mapKeyToOption)
        }
      }
    }) : []

    let placeholder = this.props.placeholder
    if (!placeholder) {
      if (options.length || extraOptions.length) {
        if (editable) {
          placeholder = 'Select or type an address'
        } else {
          placeholder = 'Select an address'
        }
      } else {
        placeholder = '(No keys in keypair manager)'
      }
    }

    const onClick = () => {
      if (!editable && !options.length && !extraOptions.length) {
        notification.error('No Available Keypiar', 'Please create or import a keypair in the keypair manager first.')
      }
    }

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
        options={[...options, ...extraOptions]}
        renderText={!editable && (option => option ? <code>{utils.isValidAddressReturn(option.id)}</code> : null)}
        value={value}
        onChange={onChange}
        invalid={invalid}
        onClick={onClick}
      />
    )
  }
}
