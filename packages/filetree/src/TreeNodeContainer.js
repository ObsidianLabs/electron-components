import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import { VelocityComponent } from 'velocity-react'
import { ContextMenuTrigger } from 'react-contextmenu'

import TreeNodeContextMenu from './TreeNodeContextMenu'

export default class TreeNodeContainer extends Component {
  static propTypes = {
    style: PropTypes.object,
    decorators: PropTypes.object.isRequired,
    terminal: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,
    animations: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.bool
    ]).isRequired,
    node: PropTypes.object.isRequired,
    readonly: PropTypes.bool
  }

  onOpen = e => {
    this.props.onClick(e)
  }

  render () {
    const {
      style,
      decorators,
      terminal,
      node,
      contextMenu,
      readonly,
    } = this.props

    return (
      <div key={node.path}>
        <ContextMenuTrigger
          id={node.path}
          ref={ref => { this.clickableRef = ref }}
          disable={readonly}
          attributes={{
            // style: style.container,
            className: classnames('dropdown-item filetree-item py-0', { active: !!node.active }),
            onClick: e => this.onOpen(e)
          }}
        >
          {!terminal ? this.renderToggle() : null}
          <decorators.Header node={node} style={style.header} />
          <TreeNodeContextMenu
            node={node}
            contextMenu={contextMenu}
            onOpen={this.onOpen}
            readonly={readonly}
          />
        </ContextMenuTrigger>
      </div>
    )
  }

  renderToggle () {
    const { animations } = this.props

    if (!animations) {
      return this.renderToggleDecorator()
    }

    return (
      <VelocityComponent
        animation={animations.toggle.animation}
        duration={animations.toggle.duration}
        ref={ref => this.velocityRef = ref}
      >
        {this.renderToggleDecorator()}
      </VelocityComponent>
    )
  }

  renderToggleDecorator () {
    const { style, decorators } = this.props
    return <decorators.Toggle style={style.toggle} />
  }
}
