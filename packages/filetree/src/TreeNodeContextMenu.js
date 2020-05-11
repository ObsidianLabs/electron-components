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

  render () {
    const { node, contextMenu } = this.props
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
