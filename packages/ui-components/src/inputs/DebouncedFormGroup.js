import React, { forwardRef } from 'react'
import PropTypes from 'prop-types'

import {
  Label,
  FormGroup,
} from 'reactstrap'

import DebouncedInput from './DebouncedInput'

export default forwardRef(DebouncedFormGroup)

function DebouncedFormGroup (props, ref) {
  const { label, disabled, placeholder, inputType = 'input', onTextClick, ...otherProps } = props

  return (
    <FormGroup>
      <Label>{label}</Label>
      {
        inputType === 'input' &&
        <DebouncedInput
          ref={ref}
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