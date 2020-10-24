import React, { forwardRef, useMemo } from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'

import {
  Label,
  FormGroup,
  UncontrolledTooltip,
} from 'reactstrap'

import DebouncedInput from './DebouncedInput'

export default forwardRef(DebouncedFormGroup)

function LabelTooltip (props) {
  if (!props.tooltip) {
    return null
  }

  const id = useMemo(() => `tooltip-input-${Math.floor(Math.random() * 10000)}`, [])
  return <>
    <span id={id} key={id} className={classnames(props.size === 'sm' ? 'small ml-1' : 'ml-2', 'text-muted')} >
      <i className={'far fa-info-circle'} />
    </span>
    <UncontrolledTooltip target={id}>{props.tooltip}</UncontrolledTooltip>
  </>
}

function DebouncedFormGroup (props, ref) {
  const { size, label, disabled, placeholder, inputType = 'input', onTextClick, formGroupClassName, ...otherProps } = props

  return (
    <FormGroup className={classnames(size === 'sm' && 'mb-2', formGroupClassName)}>
      <Label className={classnames(size === 'sm' && 'mb-1 small font-weight-bold')}>{label}</Label>
      <LabelTooltip tooltip={props.tooltip} size={size} />
      {
        inputType === 'input' &&
        <DebouncedInput
          ref={ref}
          size={size}
          disabled={disabled}
          placeholder={placeholder}
          {...otherProps}
        />
      }
      {
        inputType === 'text' &&
        <div className={onTextClick ? 'cursor-pointer' : ''}>
          <pre onClick={onTextClick} className="break-word">
            {placeholder}
          </pre>
        </div>
      }
    </FormGroup>
  )
}

DebouncedFormGroup.propTypes = {
  label: PropTypes.node,
}