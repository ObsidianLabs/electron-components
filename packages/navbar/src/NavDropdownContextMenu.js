import React, { PureComponent } from 'react'
import { ContextMenu, MenuItem } from 'react-contextmenu'

export default class NavDropdownContextMenu extends PureComponent {
  renderMenuItem = (menuItem, index) => {
    if (!menuItem) {
      return <MenuItem key={`menu-item-${index}`} divider className='dropdown-divider' />
    }

    return (
      <MenuItem 
        key={`menu-item-${index}`}
        onClick={event => {
          event.stopPropagation()
          menuItem.onClick(this.props.item)
        }}
      >
        {menuItem.text}
      </MenuItem>
    )
  }

  render () {
    const { contextMenu, route, item } = this.props
    if (!contextMenu || !contextMenu.length) {
      return null
    }

    return (
      <ContextMenu id={`dropdown-item-${route}-${item.id}`}>
        {contextMenu.map(this.renderMenuItem)}
      </ContextMenu>
    )
  }
}
