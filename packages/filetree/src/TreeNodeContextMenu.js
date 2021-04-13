import React, { PureComponent } from 'react'
import { ContextMenu, MenuItem } from 'react-contextmenu'

ContextMenu.defaultProps.className = 'dropdown-menu dropdown-menu-sm show'
MenuItem.defaultProps.className = 'dropdown-item'

export default class TreeNodeContextMenu extends PureComponent {
  renderMenuItem = (menuItem, index) => {
    if (!menuItem) {
      return <MenuItem key={`menu-item-${index}`} divider className='dropdown-divider' />
    }

    const onClick = event => {
      event.stopPropagation()
      if (menuItem.onClick) {
        menuItem.onClick(this.props.node)
      } else {
        this.props.onOpen(event)
      }
    }

    return (
      <MenuItem
        key={`menu-item-${index}`}
        onClick={onClick}
      >
        {menuItem.text}
      </MenuItem>
    )
  }

  render () {
    const { node } = this.props

    let contextMenu
    if (node.root) {
      contextMenu = this.props.contextMenu.slice(0, -3)
    } else {
      contextMenu = this.props.contextMenu
    }

    if (!contextMenu || !contextMenu.length) {
      return null
    }

    return (
      <ContextMenu id={node.path}>
        {contextMenu.map(this.renderMenuItem)}
      </ContextMenu>
    )
  }
}
