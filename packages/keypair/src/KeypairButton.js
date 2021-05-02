import React, { PureComponent } from 'react'

import KeypairManagerModal from './KeypairManagerModal'

export default class KeypairButton extends PureComponent {
  constructor (props) {
    super(props)
    this.modal = React.createRef()
  }

  openModal = () => {
    this.modal.current.openModal()
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