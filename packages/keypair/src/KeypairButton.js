import React, { PureComponent } from 'react'
import redux from '@obsidians/redux'

import KeypairManagerModal from './KeypairManagerModal'

export default class KeypairButton extends PureComponent {
  constructor (props) {
    super(props)
    this.modal = React.createRef()
  }

  openModal = () => {
    let chain
    if (this.props.chains) {
      const network = redux.getState().network
      console.log(network)
      chain = this.props.chains.find(c => c.network === network || c.key === network)?.key
    }
    this.modal.current.openModal(chain)
  }

  render () {
    const {
      chains,
      secretName = 'Private Key',
      modifyNameDisabled,
      deletionDisabled,
    } = this.props

    return <>
      <div onClick={this.openModal}>{this.props.children}</div>
      <KeypairManagerModal
        ref={this.modal}
        chains={chains}
        secretName={secretName}
        modifyNameDisabled={modifyNameDisabled}
        deletionDisabled={deletionDisabled}
      />
    </>
  }
}