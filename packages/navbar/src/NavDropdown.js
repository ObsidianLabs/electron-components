import React, { Component, PureComponent } from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'

import {
  ButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap'

import { ContextMenuTrigger } from 'react-contextmenu'

export default class NavDropdown extends Component {
  static propTypes = {
    selected: PropTypes.string.isRequired,
    list: PropTypes.array.isRequired,
    onClickItem: PropTypes.func.isRequired,
    icon: PropTypes.string,
  }

  state = {
    dropdown: false,
  }

  onToggle = event => {
    if (this.props.onToggle) {
      if (this.props.onToggle(event)) {
        return        
      }
    }
    this.setState({ dropdown: !this.state.dropdown })
  }

  renderDropdownList = list => {
    if (!list.length) {
      return <DropdownItem disabled>(None)</DropdownItem>
    }
    return list.map(this.renderDropdownItem)
  }

  renderDropdownItem = (item, index) => {
    if (item.divider) {
      return <DropdownItem divider key={`dropdown-item-divider-${index}`} />
    } else if (item.header) {
      return <DropdownItem header key={`dropdown-item-header-${index}`}>{item.header}</DropdownItem>
    } else if (item.none) {
      return <DropdownItem disabled key={`dropdown-item-none-${index}`}>(None)</DropdownItem>
    }

    const { id, route, name } = item
    const isSelected = this.props.selected === id && this.props.route === route

    return (
      <DropdownItem
        key={`dropdown-item-header-${id}`}
        className={classnames({ active: isSelected })}
        onClick={event => {
          event.preventDefault()
          this.props.onClickItem(item)
        }}
      >
        <ContextMenuTrigger id={`dropdown-item-${this.props.route}-${id}`}>
          <span key={`dropdown-item-${isSelected}`}>
            <i className={classnames('mr-2', isSelected ? 'fas' : 'fal', item.icon || this.props.icon)} />
          </span>
          {name}
        </ContextMenuTrigger>
      </DropdownItem>
    )
  }

  render () {
    const { list, children, right } = this.props

    return (
      <ButtonDropdown
        group={false}
        className='d-flex flex-1 w-100'
        isOpen={this.state.dropdown}
        toggle={this.onToggle}
      >
        <DropdownToggle
          tag='div'
          caret
          className='nav-dropdown-toggle p-0'
          onClick={event => event.preventDefault()}
        >
          {children}
        </DropdownToggle>
        <DropdownMenu right={right} style={{ top: 48, [right ? 'right' : 'left']: 4 }}>
          {this.renderDropdownList(list)}
        </DropdownMenu>
      </ButtonDropdown>
    )
  }
}
