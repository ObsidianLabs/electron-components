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
          ? buttonVariants[color]
          : buttonVariants[color]
        : 'bg-transparent border-transparent ',
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

const buttonVariants = {
  primary: [
    'text-[#fff] bg-[#007bff] border-[#007bff]',
    'hover:text-[#fff] hover:bg-[#0069d9] hover:border-[#0062cc]',
    'focus:text-[#fff] focus:bg-[#0069d9] focus:border-[#0062cc] focus:shadow-[0_0_0_0.2rem_rgba(38,143,255,0.5)]',
    'disabled:text-[#fff] disabled:bg-[#007bff] disabled:border-[#007bff]',
    'not-disabled:active:text-[#fff] not-disabled:active:bg-[#0062cc] not-disabled:active:border-[#005cbf]',
    'not-disabled:active:focus:shadow-[0_0_0_0.2rem_rgba(38,143,255,0.5)]'
  ].join(' '),
  secondary: [
    'text-[#fff] bg-[#6c757d] border-[#6c757d]',
    'hover:text-[#fff] hover:bg-[#5a6268] hover:border-[#545b62]',
    'focus:text-[#fff] focus:bg-[#5a6268] focus:border-[#545b62] focus:shadow-[0_0_0_0.2rem_rgba(130,138,145,0.5)]',
    'disabled:text-[#fff] disabled:bg-[#6c757d] disabled:border-[#6c757d]',
    'not-disabled:active:text-[#fff] not-disabled:active:bg-[#545b62] not-disabled:active:border-[#4e555b]',
    'not-disabled:active:focus:shadow-[0_0_0_0.2rem_rgba(130,138,145,0.5)]'
  ].join(' '),
  success: [
    'text-[#fff] bg-[#28a745] border-[#28a745]',
    'hover:text-[#fff] hover:bg-[#218838] hover:border-[#1e7e34]',
    'focus:text-[#fff] focus:bg-[#218838] focus:border-[#1e7e34] focus:shadow-[0_0_0_0.2rem_rgba(72,180,97,0.5)]',
    'disabled:text-[#fff] disabled:bg-[#28a745] disabled:border-[#28a745]',
    'not-disabled:active:text-[#fff] not-disabled:active:bg-[#1e7e34] not-disabled:active:border-[#1c7430]',
    'not-disabled:active:focus:shadow-[0_0_0_0.2rem_rgba(72,180,97,0.5)]'
  ].join(' '),
  info: [
    'text-[#fff] bg-[#17a2b8] border-[#17a2b8]',
    'hover:text-[#fff] hover:bg-[#138496] hover:border-[#117a8b]',
    'focus:text-[#fff] focus:bg-[#138496] focus:border-[#117a8b] focus:shadow-[0_0_0_0.2rem_rgba(58,176,195,0.5)]',
    'disabled:text-[#fff] disabled:bg-[#17a2b8] disabled:border-[#17a2b8]',
    'not-disabled:active:text-[#fff] not-disabled:active:bg-[#117a8b] not-disabled:active:border-[#10707f]',
    'not-disabled:active:focus:shadow-[0_0_0_0.2rem_rgba(58,176,195,0.5)]'
  ].join(' '),
  warning: [
    'text-[#212529] bg-[#ffc107] border-[#ffc107]',
    'hover:text-[#212529] hover:bg-[#e0a800] hover:border-[#d39e00]',
    'focus:text-[#212529] focus:bg-[#e0a800] focus:border-[#d39e00] focus:shadow-[0_0_0_0.2rem_rgba(222,170,12,0.5)]',
    'disabled:text-[#212529] disabled:bg-[#ffc107] disabled:border-[#ffc107]',
    'not-disabled:active:text-[#212529] not-disabled:active:bg-[#d39e00] not-disabled:active:border-[#c69500]',
    'not-disabled:active:focus:shadow-[0_0_0_0.2rem_rgba(222,170,12,0.5)]'
  ].join(' '),
  danger: [
    'text-[#fff] bg-[#dc3545] border-[#dc3545]',
    'hover:text-[#fff] hover:bg-[#c82333] hover:border-[#bd2130]',
    'focus:text-[#fff] focus:bg-[#c82333] focus:border-[#bd2130] focus:shadow-[0_0_0_0.2rem_rgba(225,83,97,0.5)]',
    'disabled:text-[#fff] disabled:bg-[#dc3545] disabled:border-[#dc3545]',
    'not-disabled:active:text-[#fff] not-disabled:active:bg-[#bd2130] not-disabled:active:border-[#b21f2d]',
    'not-disabled:active:focus:shadow-[0_0_0_0.2rem_rgba(225,83,97,0.5)]'
  ].join(' '),
  light: [
    'text-[#212529] bg-[#f8f9fa] border-[#f8f9fa]',
    'hover:text-[#212529] hover:bg-[#e2e6ea] hover:border-[#dae0e5]',
    'focus:text-[#212529] focus:bg-[#e2e6ea] focus:border-[#dae0e5] focus:shadow-[0_0_0_0.2rem_rgba(216,217,219,0.5)]',
    'disabled:text-[#212529] disabled:bg-[#f8f9fa] disabled:border-[#f8f9fa]',
    'not-disabled:active:text-[#212529] not-disabled:active:bg-[#dae0e5] not-disabled:active:border-[#d3d9df]',
    'not-disabled:active:focus:shadow-[0_0_0_0.2rem_rgba(216,217,219,0.5)]'
  ].join(' '),
  dark: [
    'text-[#fff] bg-[#343a40] border-[#343a40]',
    'hover:text-[#fff] hover:bg-[#23272b] hover:border-[#1d2124]',
    'focus:text-[#fff] focus:bg-[#23272b] focus:border-[#1d2124] focus:shadow-[0_0_0_0.2rem_rgba(82,88,93,0.5)]',
    'disabled:text-[#fff] disabled:bg-[#343a40] disabled:border-[#343a40]',
    'not-disabled:active:text-[#fff] not-disabled:active:bg-[#1d2124] not-disabled:active:border-[#171a1d]',
    'not-disabled:active:focus:shadow-[0_0_0_0.2rem_rgba(82,88,93,0.5)]'
  ].join(' ')
}
