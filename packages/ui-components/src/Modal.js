import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'

import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Alert
} from 'reactstrap'

export default class BaseModal extends Component {
  static propTypes = {
    wide: PropTypes.bool,
    overflow: PropTypes.bool,
    fullscreen: PropTypes.bool,
    title: PropTypes.node,
    textConfirm: PropTypes.node,
    colorConfirm: PropTypes.string,
    onConfirm: PropTypes.func,
    confirmDisabled: PropTypes.bool,
    ActionBtn: PropTypes.node,
    textActions: PropTypes.node,
    colorActions: PropTypes.array,
    onActions: PropTypes.array,
    textCancel: PropTypes.string,
    colorCancel: PropTypes.string,
    onCancel: PropTypes.func,
    noCancel: PropTypes.bool,
    children: PropTypes.node,
    onAdditionAction: PropTypes.func,
    textAddition: PropTypes.string,
    colorAddition: PropTypes.string,
    onClosed: PropTypes.func
  }

  state = {
    isOpen: false,
    error: ''
  }

  shouldComponentUpdate (props, state) {
    return (
      props.confirmDisabled !== this.props.confirmDisabled ||
      props.children !== this.props.children ||
      state.isOpen !== this.state.isOpen ||
      state.error !== this.state.error
    )
  }

  openModal () {
    return this.setState({ isOpen: true })
  }

  async closeModal () {
    if (!this.props.onCancel || await this.props.onCancel()) {
      this.setState({ isOpen: false, error: '' })
    }
  }

  showError (error) {
    this.setState({ error })
  }

  hideError () {
    this.setState({ error: '' })
  }

  toggle = () => this.closeModal()

  renderConfirmButton = ({ onConfirm, colorConfirm = 'primary', confirmDisabled, textConfirm = 'Confirm', pending }) => {
    if (!onConfirm) {
      return null
    }

    if (!pending) {
      return (
        <Button
          key='modal-confirm-btn-not-pending'
          color={colorConfirm}
          className='ml-2'
          disabled={!!confirmDisabled}
          onClick={onConfirm}
        >
          {textConfirm}
        </Button>
      )
    }

    return (
      <Button
        key='modal-confirm-btn-pending'
        color={colorConfirm}
        className='ml-2'
        disabled
      >
        <i className='fas fa-spin fa-spinner mr-1' />{pending}
      </Button>
    )
  }

  render () {
    const {
      wide,
      overflow,
      fullscreen,
      h100,
      title,
      ActionBtn = null,
      textActions,
      colorActions = [],
      onActions,
      textCancel = 'Cancel',
      colorCancel = 'default',
      noCancel,
      onAdditionAction,
      textAddition = '',
      colorAddition = 'default',
      onClosed = () => {},
      className,
      children,
    } = this.props

    let errorComponent = null
    if (this.state.error) {
      errorComponent = (
        <Alert color='danger'>
          <pre>{this.state.error}</pre>
        </Alert>
      )
    }

    return (
      <Modal
        isOpen={this.state.isOpen}
        style={{ userSelect: 'none', maxWidth: wide && '1000px' }}
        className={classnames({ 'modal-fullscreen': fullscreen, 'h-100': h100 }, className)}
        contentClassName={h100 && 'h-100'}
        onClosed={onClosed}
      >
        <ModalHeader toggle={noCancel ? undefined : this.toggle}>{title}</ModalHeader>
        <ModalBody
          className={classnames('d-flex flex-column', !overflow && 'overflow-auto')}
        >
          {children}
          {errorComponent}
        </ModalBody>
        <ModalFooter style={{ justifyContent: 'space-between' }}>
          <div>
            {ActionBtn}
            {textActions && textActions.map((t, i) => <Button key={`action-${i}`} color={colorActions && colorActions[i] ? colorActions[i] : 'success'} className='mr-2' onClick={onActions[i]}>{t}</Button>)}
          </div>
          <div>
            { onAdditionAction && textAddition && <Button color={colorAddition} onClick={onAdditionAction}>{textAddition}</Button> }
            { !noCancel && textCancel && <Button color={colorCancel} onClick={this.toggle}>{textCancel}</Button> }
            {this.renderConfirmButton(this.props)}
          </div>
        </ModalFooter>
      </Modal>
    )
  }
}
