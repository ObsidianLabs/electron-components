import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

const Badge = ({
  className,
  color = 'secondary',
  pill = false,
  ...attributes
}) => {
  const classes = classNames(
    className,
    'inline py-[0.25em] px-[0.4em] text-[75%] font-bold',
    'leading-none text-center whitespace-nowrap align-baseline',
    'rounded transition-colors transition-shadow duration-150 ease-in-out',
    'print:border-1 print:border-black motion-reduce:transition-none',
    'hover:no-underline empty:hidden',
    `bg-badge-${color} text-badge-${color}`,
    pill ? 'px-[0.6em] rounded-full' : false
  )

  return <span {...attributes} className={classes} />
}

Badge.propTypes = {
  color: PropTypes.string,
  pill: PropTypes.bool,
  children: PropTypes.node,
  className: PropTypes.string
}

export default Badge

// DO NOT REMOVE FOLLOWING LINES!
// bg-badge-primary
// bg-badge-secondary
// bg-badge-success
// bg-badge-info
// bg-badge-warning
// bg-badge-danger
// bg-badge-light
// bg-badge-dark
// text-badge-primary
// text-badge-secondary
// text-badge-success
// text-badge-info
// text-badge-warning
// text-badge-danger
// text-badge-light
// text-badge-dark
