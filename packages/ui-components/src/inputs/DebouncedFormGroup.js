import React, { forwardRef } from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'

import {
  Label,
  FormGroup,
} from 'reactstrap'

import DebouncedInput from './DebouncedInput'

export default forwardRef(DebouncedFormGroup)

function DebouncedFormGroup (props, ref) {
  const { size, label, disabled, placeholder, inputType = 'input', onTextClick, formGroupClassName, ...otherProps } = props

  return (
    <FormGroup className={classnames(size === 'sm' && 'mb-2', formGroupClassName)}>
      <Label className={classnames(size === 'sm' && 'mb-1 small font-weight-bold')}>{label}</Label>
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