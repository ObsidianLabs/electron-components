import React, { PureComponent } from 'react'

import { ToolbarButton } from '@obsidians/ui-components'
import BaseProjectManager from '../ProjectManager/BaseProjectManager'
import actions from '../actions'

export default class TerminalButton extends PureComponent {
  state = {
    terminal: false,
  }

  componentDidMount () {
    BaseProjectManager.terminalButton = this
    actions.register({
      toggleTerminal: this.toggleTerminal.bind(this),
    })
  }

  toggleTerminal = () => {
    BaseProjectManager.instance.toggleTerminal(!this.state.terminal)
  }

  render () {
    const { size = 'sm' } = this.props

    return (
      <ToolbarButton
        id='terminal'
        size={size}
        icon='fas fa-terminal'
        color={this.state.terminal ? 'primary' : 'default'}
        onClick={this.toggleTerminal}
      />
    )
  }
}
