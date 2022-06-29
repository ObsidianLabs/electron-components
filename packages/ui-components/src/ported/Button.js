import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { tagPropType } from './utils'

const propTypes = {
  active: PropTypes.bool,
  'aria-label': PropTypes.string,
  block: PropTypes.bool,
  color: PropTypes.string,
  disabled: PropTypes.bool,
  outline: PropTypes.bool,
  tag: tagPropType,
  innerRef: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.func,
    PropTypes.string
  ]),
  onClick: PropTypes.func,
  size: PropTypes.string,
  children: PropTypes.node,
  className: PropTypes.string,
  close: PropTypes.bool
}

const defaultProps = {
  color: 'secondary',
  tag: 'button'
}

class Button extends React.Component {
  constructor(props) {
    super(props)

    this.onClick = this.onClick.bind(this)
  }

  onClick(e) {
    if (this.props.disabled) {
      e.preventDefault()
      return
    }

    if (this.props.onClick) {
      return this.props.onClick(e)
    }
  }

  render() {
    let {
      active,
      'aria-label': ariaLabel,
      block,
      className,
      close,
      color,
      outline,
      size,
      tag: Tag,
      innerRef,
      ...attributes
    } = this.props

    if (close && typeof attributes.children === 'undefined') {
      attributes.children = <span aria-hidden>×</span>
    }

    // Used class names:
    // - .close: float-right text-2xl font-bold leading-none text-black opacity-50
    //   hover:text-black hover:no-underline
    //   text-shadow: 0 1px 0 #fff
    // - .btn: bg-transparent border-transparent rounded border-solid border inline-block font-normal text-base leading-normal py-1 px-3 text-center select-none align-middle
    //   transition-all duration-150 ease-in-out
    // - .btn-<color>
    // - .btn-outline-<color>
    // - `.btn-sm`: py-1 px-2 text-sm leading-normal rounded-[0.2rem]
    // - .btn-lg: py-2 px-4 text-xl leading-normal rounded-[0.3rem]
    // - .btn-block: block w-full
    // - .active: ???
    // - .disabled: opacity-[65%] disabled:opacity-[65%]
    const classes = classNames(
      className,
      close
        ? 'float-right text-2xl font-bold leading-none text-black opacity-50 hover:text-black hover:no-underline'
        : 'rounded border-solid border inline-block font-normal text-base leading-normal py-1 px-3 text-center select-none align-middle transition-all duration-150 ease-in-out',
      close || color
        ? outline
          ? `button-${color}-outline`
          : `button-${color}`
        : 'bg-transparent border-transparent',
      size === 'sm'
        ? 'py-1 px-2 text-sm leading-normal rounded-[0.2rem]'
        : null,
      size === 'lg'
        ? 'py-2 px-4 text-xl leading-normal rounded-[0.3rem]'
        : null,
      block ? 'block w-full' : null,
      { active },
      this.props.disabled ? 'opacity-[65%]' : null,
      'disabled:opacity-[65%]'
    )

    if (attributes.href && Tag === 'button') {
      Tag = 'a'
    }

    const defaultAriaLabel = close ? 'Close' : null

    return (
      <Tag
        type={Tag === 'button' && attributes.onClick ? 'button' : undefined}
        {...attributes}
        className={classes}
        ref={innerRef}
        onClick={this.onClick}
        aria-label={ariaLabel || defaultAriaLabel}
      />
    )
  }
}

Button.propTypes = propTypes
Button.defaultProps = defaultProps

export default Button

// Important Notes
// ===============
//
// Don't delete following lines.
// They are used for Tailwind extraction.
// Deleting them will unstylize all buttons.
//
// button-primary button-primary-outline
// button-secondary button-secondary-outline
// button-success button-success-outline
// button-info button-info-outline
// button-warning button-warning-outline
// button-danger button-danger-outline
// button-light button-light-outline
// button-dark button-dark-outline
