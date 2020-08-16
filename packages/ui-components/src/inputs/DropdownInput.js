import React, { PureComponent } from 'react'

import {
  FormGroup,
  Label,
  UncontrolledButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap'

export default class DropdownInput extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      selected: this.props.value
    }
  }

  componentDidUpdate (prevProps) {
    if (this.props.value !== prevProps.value) {
      this.setState({ selected: this.props.value })
    }
  }

  findSelectedOption = (options, id) => {
    for (const item of options) {
      if (item.id && item.id === id) {
        return item
      }
      if (Array.isArray(item.children)) {
        for (const subitem of item.children) {
          if (subitem.id && subitem.id === id) {
            return { group: item.group, ...subitem }
          }
        }
      }
    }
  }

  renderText = option => {
    if (!option) {
      return <span className='text-muted'>(None)</span>
    }
    if (this.props.renderText) {
      return this.props.renderText(option)
    }
    return option.display
  }

  renderOptions = (options, selected) => {
    if (!options.length) {
      const { placeholder = '(No options)' } = this.props
      return <DropdownItem disabled>{placeholder}</DropdownItem>
    }

    const components = []

    options.forEach((item, index) => {
      if (Array.isArray(item.children)) {
        if (item.group) {
          components.push(<DropdownItem key={`header-${index}`} header>{item.group}</DropdownItem>)
        }
        item.children.forEach(subitem => {
          components.push((
            <DropdownItem
              key={`item-${subitem.id}`}
              active={subitem.id === selected}
              disabled={subitem.disabled}
              onClick={() => subitem.onClick ? subitem.onClick() : this.props.onChange(subitem.id)}
            >
              {subitem.display}
            </DropdownItem>
          ))
        })
        components.push(<DropdownItem key={`divider-${index}`} divider />)
      } else {
        components.push((
          <DropdownItem
            key={`item-${item.id}`}
            active={item.id === selected}
            disabled={item.disabled}
            onClick={() => item.onClick ? item.onClick() : this.props.onChange(item.id)}
          >
            {item.display}
          </DropdownItem>
        ))
      }
    })

    if (components[components.length - 1].key.startsWith('divider-')) {
      components.pop()
    }

    return components
  }

  render () {
    const {
      label,
      options = [],
    } = this.props

    const selectedOption = this.findSelectedOption(options, this.state.selected)

    return (
      <FormGroup>
        <Label>{label}</Label>
        <UncontrolledButtonDropdown className='btn-block' direction='down' >
          <DropdownToggle caret className='bg2 d-flex align-items-center justify-content-between'>
            {this.renderText(selectedOption)}
          </DropdownToggle>
          <DropdownMenu className='w-100'>
            {this.renderOptions(options, this.state.selected)}
          </DropdownMenu>
        </UncontrolledButtonDropdown>
      </FormGroup>
    )

  }
}