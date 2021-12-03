import React, { PureComponent } from 'react'
import { ContextMenu, MenuItem } from 'react-contextmenu'

// TODO: set the default props only once, and need consider to deprecate the lib, This repository has been archived by the owner.
ContextMenu.defaultProps.className = 'dropdown-menu dropdown-menu-sm show'
MenuItem.defaultProps.className = 'dropdown-item'

export default class TabContextMenu extends PureComponent {
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
      <ContextMenu id={`${node.key}/tab-item`} preventHideOnContextMenu={false}>
        {contextMenu.map(this.renderMenuItem)}
      </ContextMenu>
    )
  }
}
