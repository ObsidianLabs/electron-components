import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'

import {
  Button,
  Tooltip,
} from 'reactstrap'

const deleteButtons = {}

export default class DeleteButton extends PureComponent {
  static propTypes = {
    size: PropTypes.string,
    textConfirm: PropTypes.string,
    onConfirm: PropTypes.func,
    className: PropTypes.string
  }

  state = {
    confirming: false
  }

  constructor (props) {
    super(props)
    this.id = Math.floor(Math.random() * 10000)
    deleteButtons[this.id] = this
  }

  componentWillUnmount () {
    delete deleteButtons[this.id]
    this.setState({ confirming: false })
    clearTimeout(this.timeout)
  }

  showConfirm = () => {
    Object.keys(deleteButtons).forEach(id => {
      deleteButtons[id] && deleteButtons[id].setState({ confirming: false })
    })
    this.setState({ confirming: true })
    this.timeout = setTimeout(() => {
      this.setState({ confirming: false })
    }, 2000)
  }

  onConfirm = () => {
    this.setState({ confirming: false })
    this.props.onConfirm && this.props.onConfirm()
  }

  render () {
    const {
      textConfirm = 'Click again to delete',
      style,
      icon = 'far fa-trash-alt',
      className = '',
    } = this.props

    if (this.state.confirming) {
      return (
        <Button
          size='sm'
          color='danger'
          key={`confirm-delete-${this.id}`}
          id={`confirm-delete-${this.id}`}
          color='danger'
          className={className}
          style={style}
          onClick={this.onConfirm}
        >
          <i className={icon} />
          <Tooltip placement='top' isOpen target={`confirm-delete-${this.id}`}>
            <i className='fas fa-exclamation-circle' /> {textConfirm}
          </Tooltip>
        </Button>
      )
    } else {
      return (
        <Button
          size='sm'
          color='transparent'
          className={classnames('text-muted', className)}
          key={`confirm-delete-${this.id}`}
          id={`confirm-delete-${this.id}`}
          style={style}
          onClick={this.showConfirm}
        >
          <i className={icon} />
        </Button>
      )
    }
  }
}
