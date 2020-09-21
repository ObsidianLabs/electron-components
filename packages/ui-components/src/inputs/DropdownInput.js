import React, { PureComponent } from 'react'
import classnames from 'classnames'

import {
  FormGroup,
  Label,
  InputGroup,
  InputGroupAddon,
  Button,
  Input,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap'

export default class DropdownInput extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      dropdownOpen: false,
      paddingRight: 8,
    }
    this.input = React.createRef()
    this.toggler = React.createRef()
  }

  componentDidUpdate (prevProps) {
    if (prevProps.value === this.props.value) {
      return
    }
    setTimeout(() => {
      const togglerWidth = this.toggler.current?.offsetWidth
      if (togglerWidth) {
        this.setState({ paddingRight: togglerWidth })
      }
    }, 100)
  }

  onChange = event => {
    this.props.onChange(event.target.value)
  }

  onKeyPress = event => {
    if (event.charCode === 13) {
      this.input.current.blur()
      this.setState({ dropdownOpen: false })
    }
  }

  onClickInput = event => {
    event.stopPropagation()
    this.setState({ dropdownOpen: true })
  }

  toggleDropdown = () => {
    this.setState({ dropdownOpen: !this.state.dropdownOpen })
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
      return null
    }
    if (this.props.renderText) {
      return this.props.renderText(option)
    }
    return null
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
      size,
      label,
      addon,
      placeholder,
      editable,
      maxLength,
      noCaret,
      options = [],
      value,
      inputClassName,
    } = this.props
    const paddingRight = this.state.paddingRight

    const selectedOption = this.findSelectedOption(options, value)

    const inputGroup = (
      <InputGroup
        size={size}
        className='flex-nowrap'
      >
        <InputGroupAddon addonType='prepend'>
        { addon 
          ? <Button color='secondary' className={classnames(size === 'sm' ? 'px-0' : 'px-1')}><div className='w-5'>{addon}</div></Button>
          : null
        }
        </InputGroupAddon>
        <Dropdown
          className='d-flex flex-grow-1'
          direction='down'
          isOpen={this.state.dropdownOpen}
          toggle={this.toggleDropdown}
        >
          <div
            className='d-flex flex-grow-1'
            onClick={this.toggleDropdown}
          >
            <Input
              innerRef={this.input}
              bsSize={size}
              className={inputClassName}
              style={addon ? { borderTopLeftRadius: 0, borderBottomLeftRadius: 0, paddingRight } : null}
              value={value}
              onChange={this.onChange}
              maxLength={maxLength}
              onKeyPress={this.onKeyPress}
              onClick={this.onClickInput}
              placeholder={placeholder}
              disabled={!editable}
            />
          </div>
          <div
            ref={this.toggler}
            className={'p-absolute h-100'}
            style={{ right: 0, zIndex: 100 }}
          >
            <DropdownToggle
              caret={!noCaret}
              className={classnames('bg-transparent d-flex align-items-center h-100', size === 'sm' && 'px-1')}
            >
              {this.renderText(selectedOption)}
            </DropdownToggle>
          </div>
          <DropdownMenu right className={classnames('input-dropdown-menu', size && `dropdown-menu-${size}`)}>
            {this.renderOptions(options, value)}
          </DropdownMenu>
        </Dropdown>
      </InputGroup>
    )

    if (!label) {
      return inputGroup
    }

    return (
      <FormGroup className={classnames(size === 'sm' && 'mb-2')}>
        <Label className={classnames(size === 'sm' && 'mb-1 small font-weight-bold')}>{label}</Label>
        {inputGroup}
      </FormGroup>
    )
  }
}