import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import {
  Modal,
  Button,
  ListGroupItem
} from '@obsidians/ui-components'

export default class TutorialModal extends PureComponent {
  static get propTypes() {
    return {
      header: PropTypes.string,
      description: PropTypes.string
    }
  }

  constructor(props) {
    super(props)
    this.state = {}
    this.modal = React.createRef()
    this.toGuidePage = this.toGuidePage.bind(this)
    this.showModal = this.showModal.bind(this)
    this.closeModal = this.closeModal.bind(this)
  }

  showModal() {
    this.modal.current.openModal()
  }

  closeModal() {
    this.modal.current.closeModal()
  }

  toGuidePage() {
    console.log('visit guide page')
  }

  render() {
    const { header, description } = this.props

    return (
      <Modal
        ref={this.modal}
        title={header}>
        <div>
          <p style={{ 'fontSize': '15px' }}>
            { description }
          </p>
          <ListGroupItem className='center' style={{
            'margin': '5px 0',
            'borderRadius': '6px'
          }}>
            <div className='center'>
              <div className='tutorialPanel' />
              <p>Learn how to use Ethereum Studio</p>
            </div>

            <Button
              onClick={this.toGuidePage}
              color={'primary'}>
              Open
            </Button>
          </ListGroupItem>
        </div>
      </Modal>
    )
  }
}
