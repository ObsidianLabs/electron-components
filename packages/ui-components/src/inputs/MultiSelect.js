import React, { PureComponent } from 'react'

import {
  InputGroupAddon,
} from 'reactstrap'

import Select, { components } from 'react-select'

import './multiselect.scss'

export default class MultiSelect extends PureComponent {
  handleChange = selectedOption => {
    this.setState(
      { selectedOption },
      () => console.log(`Option selected:`, this.state.selectedOption)
    )
  }

  onChange = async (items, change) => {
    switch (change.action) {
      case 'select-option':
        try {
          const value = await change.option.getValue()
          this.props.onChange([...this.props.value, value])
        } catch (e) {
          console.warn(e)
        }
        return
      case 'remove-value':
      case 'pop-value':
      case 'clear':
        this.props.onChange(items || [])
        break;
    }
  }

  onClickLabel = async data => {
    const newLabel = await this.props.onClickLabel(data)
    if (newLabel) {
      const index = this.props.value.indexOf(data)
      if (index > -1) {
        this.props.value[index] = newLabel
        this.props.onChange([...this.props.value])
      }
    }
  }

  render () {
    return (
      <Select
        isMulti
        isSearchable={false}
        isClearable={false}
        className='react-select-container flex-1'
        classNamePrefix='react-select'
        components={{
          Control: props => (
            <div onMouseDown={props.innerProps.onMouseDown} className='input-group input-group-sm'>
              <InputGroupAddon addonType='prepend'>
                {this.props.addon}
              </InputGroupAddon>
              {props.children}
            </div>
          ),
          ValueContainer: props => <div className='form-control h-auto'><components.ValueContainer {...props} className='p-0' /></div>,
          MultiValueLabel: props => <div {...props.innerProps} onClick={() => this.onClickLabel(props.data)} onMouseDown={event => event.stopPropagation()}>{props.children}</div>,
          IndicatorsContainer: props => <div className='input-group-append'>{props.children}</div>,
          DropdownIndicator: () => <button className="dropdown-toggle btn btn-secondary" />,
          IndicatorSeparator: () => null,
          Menu: props => <div {...props.innerProps} ref={props.ref} className='dropdown-menu dropdown-menu-right show' style={{ boxShadow: 'none', width: 'auto' }}>{props.children}</div>,
          MenuList: props => <components.MenuList {...props} className='p-0' />,
          Group: props => <components.Group {...props} className='p-0' />,
          GroupHeading: props => <h6 className='dropdown-header'>{props.children}</h6>,
          Option: props => props.data.type === 'divider' ? <div className='dropdown-divider' /> : <div className='dropdown-item' {...props.innerProps}>{props.children}</div>,
        }}
        value={this.props.value}
        options={this.props.options}
        onChange={this.onChange}
      />
    )
  }
}