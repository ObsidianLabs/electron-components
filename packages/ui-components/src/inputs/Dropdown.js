import React, { useState } from 'react'

import {
  InputGroupButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap'

export default function Dropdown (props) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const toggleDropDown = () => setDropdownOpen(!dropdownOpen)

  let dropdownItems = null
  if (!props.items || !props.items.length) {
    dropdownItems = <DropdownItem disabled>(None)</DropdownItem>
  } else {
    dropdownItems = props.items.map(item => (
      <DropdownItem
        key={item}
        onClick={() => props.onChange(item)}
      >
        <code>{item}</code>
      </DropdownItem>
    ))
  }

  return (
    <InputGroupButtonDropdown
      addonType='append'
      isOpen={dropdownOpen}
      toggle={toggleDropDown}
    >
      <DropdownToggle caret key={`dropdown-icon-${props.icon.replace(/\s/g, '-')}`}>
        <i className={`${props.icon} mr-1`} />
      </DropdownToggle>
      <DropdownMenu right>
        <DropdownItem header>{props.header}</DropdownItem>
        {dropdownItems}
      </DropdownMenu>
    </InputGroupButtonDropdown>
  )
}
