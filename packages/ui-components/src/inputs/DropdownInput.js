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
      filterMode: false,
    }

    this.dropdownOptions = null
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

  onKeyDown = event => {
    if (event.keyCode === 38 || event.keyCode === 40) {
      event.preventDefault()

      this.dropdownOptions = this.dropdownOptions || this.getDropdownOptions()
      if (!this.dropdownOptions.length) {
        return
      }
      const direction = event.keyCode === 38 ? -1 : 1
      const activeValue = this.props.value
      const activeIndex = this.dropdownOptions.findIndex(item => item.id === activeValue)
      let currentIndex = activeIndex
      if (activeIndex === -1) {
        currentIndex = direction === 1 ? -1 : this.dropdownOptions.length
      }

      currentIndex = currentIndex + direction
      while (currentIndex >= 0 && currentIndex < this.dropdownOptions.length) {
        const option = this.dropdownOptions[currentIndex]
        if (!option.disabled && !option.header && !option.divider && !option.onClick) {
          this.props.onChange(option.id)
          return
        }
        currentIndex = currentIndex + direction
      }
    } else if (event.keyCode === 13) {
      this.dropdownOptions = null
      this.input.current.blur()
      this.setState({ dropdownOpen: false, filterMode: false })
    } else {
      this.dropdownOptions = null
      this.setState({ filterMode: true })
    }
  }

  onClickInput = event => {
    event.stopPropagation()
    if (!this.state.dropdownOpen) {
      this.dropdownOptions = null
      this.setState({ dropdownOpen: true, filterMode: false })
    }
  }

  toggleDropdown = () => {
    this.dropdownOptions = null
    this.setState({ dropdownOpen: !this.state.dropdownOpen, filterMode: false })
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

  getDropdownOptions = () => {
    const { value, options = [] } = this.props
    const filterMode = this.state.filterMode
    let dropdownOptions = []

    options.forEach((item, index) => {
      if (Array.isArray(item.children)) {
        const groupOptions = []
        item.children.forEach(subitem => {
          if (filterMode && !subitem.id.includes(value)) {
            return
          }
          groupOptions.push({
            id: subitem.id,
            display: subitem.display,
            disabled: subitem.disabled,
            onClick: subitem.onClick,
          })
        })
        if (groupOptions.length) {
          groupOptions.unshift({ header: item.group, index })
          groupOptions.push({ divider: true, index })
          dropdownOptions = dropdownOptions.concat(groupOptions)
        }
      } else {
        if (filterMode && !item.id.includes(value)) {
          return
        }
        dropdownOptions.push({
          id: item.id,
          display: item.display,
          disabled: item.disabled,
          onClick: item.onClick,
        })
      }
    })

    if (dropdownOptions.length && dropdownOptions[dropdownOptions.length - 1].divider) {
      dropdownOptions.pop()
    }

    return dropdownOptions
  }

  renderOptions = () => {
    const { value, onChange, options = [] } = this.props

    if (!options.length) {
      const { placeholder = '(No options)' } = this.props
      return <DropdownItem disabled>{placeholder}</DropdownItem>
    }

    const dropdownOptions = this.dropdownOptions || this.getDropdownOptions()

    return dropdownOptions.map(item => {
      if (item.header) {
        return <DropdownItem key={`header-${item.index}`} header>{item.header}</DropdownItem>
      } else if (item.divider) {
        return <DropdownItem key={`divider-${item.index}`} divider />
      } else {
        const active = item.id === value
        const display = typeof item.display === 'function' ? item.display(value, active) : item.display
        return (
          <DropdownItem
            key={`item-${item.id}`}
            active={active}
            disabled={item.disabled}
            onClick={() => item.onClick ? item.onClick() : onChange(item.id)}
          >
            {display}
          </DropdownItem>
        )
      }
    })
  }

  renderText = (option, value) => {
    if (this.props.renderText) {
      return this.props.renderText(option, value)
    }
    return null
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
      invalid,
    } = this.props
    const paddingRight = this.state.paddingRight

    const selectedOption = this.findSelectedOption(options, value)
    const dropdownOptions = this.renderOptions()

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
          isOpen={this.state.dropdownOpen && dropdownOptions.length}
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
              onKeyDown={this.onKeyDown}
              onClick={this.onClickInput}
              placeholder={placeholder}
              disabled={!editable}
              invalid={typeof invalid === 'boolean' ? invalid : undefined}
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
              {this.renderText(selectedOption, value)}
            </DropdownToggle>
          </div>
          <DropdownMenu right className={classnames('input-dropdown-menu', size && `dropdown-menu-${size}`)}>
            {dropdownOptions}
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