import React, { useState } from 'react'
import classnames from 'classnames'

import {
  Button,
} from 'reactstrap'

export default function IconButton (props) {
  const {
    color,
    id,
    icon = 'far fa-trash-alt',
    className,
    onClick,
    children = null,
  } = props

  const [iconId] = useState(id || `icon-button-${Math.floor(Math.random() * 10000)}`)

  return (
    <Button
      size='sm'
      color={color}
      id={iconId}
      key={iconId}
      className={classnames('d-flex align-items-center', className)}
      style={{ height: 24, padding: '0 6px' }}
      onClick={onClick}
    >
      <i className={icon} />
      {children}
    </Button>
  )
}
