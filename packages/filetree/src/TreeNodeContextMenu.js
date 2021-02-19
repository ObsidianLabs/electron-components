import React, { PureComponent } from 'react'
import { ContextMenu, MenuItem } from 'react-contextmenu'

ContextMenu.defaultProps.className = 'dropdown-menu dropdown-menu-sm show'
MenuItem.defaultProps.className = 'dropdown-item'

export default class TreeNodeContextMenu extends PureComponent {
  renderMenuItem = (menuItem, index) => {
    if (!menuItem) {
      return <MenuItem key={`menu-item-${index}`} divider className='dropdown-divider' />
    }

    const onClick = !menuItem.onClick ? this.props.onOpen : event => {
      event.stopPropagation()
      menuItem.onClick(this.props.node)
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

  filterContextMenu = (node, contextMenu) => {
    if (node.root) {
      return contextMenu.slice(0, -2)
    }
    return contextMenu
  }

  render () {
    const { node, contextMenu } = this.props
    const filteredContextMenu = this.filterContextMenu(node, contextMenu)
    if (!filteredContextMenu || !filteredContextMenu.length) {
      return null
    }

    return (
      <ContextMenu id={node.path}>
        {filteredContextMenu.map(this.renderMenuItem)}
      </ContextMenu>
    )
  }
}
