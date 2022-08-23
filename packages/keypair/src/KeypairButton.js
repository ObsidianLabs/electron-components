import React, { PureComponent } from 'react'
import redux from '@obsidians/redux'
import Auth from '@obsidians/auth'
import platform from '@obsidians/platform'
import { withRouter } from 'react-router'
import notification from '@obsidians/notification'
import keypairManager from './keypairManager'
import KeypairManagerModal from './KeypairManagerModal'

class KeypairButton extends PureComponent {
  constructor (props) {
    super(props)
    this.modal = React.createRef()
  }

  componentDidMount () {
    keypairManager.loadAndUpdateKeypairs()
  }

  openModal = () => {
    if(!window.bifSDK) {
      notification.error('请先安装星火链插件钱包')
      return
    }
    const profileState = redux.getState().profile
    const profile = profileState.toJS()
    const providers = process.env.LOGIN_PROVIDERS ? process.env.LOGIN_PROVIDERS.split(',') : ['github']
    if (!profile.userId && platform.isWeb) {
      return Auth.login(this.props.history, providers[0])
    }

    let chain
    if (this.props.chains) {
      const network = redux.getState().network
      chain = this.props.chains.find(c => c.network === network || network.startsWith(c.key))?.key
    }
    this.modal.current.openModal(chain)
  }

  render () {
    const {
      chains,
      mnemonic,
      secretName = 'Private Key',
      modifyNameDisabled,
      deletionDisabled,
    } = this.props

    return <>
      <div onClick={this.openModal}>{this.props.children}</div>
      <KeypairManagerModal
        ref={this.modal}
        chains={chains}
        mnemonic={mnemonic}
        secretName={secretName}
        modifyNameDisabled={modifyNameDisabled}
        deletionDisabled={deletionDisabled}
      />
    </>
  }
}

export default withRouter(KeypairButton)