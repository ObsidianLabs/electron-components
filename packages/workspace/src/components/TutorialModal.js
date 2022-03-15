import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import {
  Modal,
  Button,
  ListGroupItem
} from '@obsidians/ui-components'

export default class TutorialModal extends PureComponent {
  // define prop types
  static get propTypes() {
    return {
      header: PropTypes.string,
      description: PropTypes.string
    }
  }

  // constructor function
  constructor(props) {
    super(props)
    this.state = {} // initial local state
    this.modal = React.createRef()  // create react ref of modal
    this.toGuidePage = this.toGuidePage.bind(this)
    this.showModal = this.showModal.bind(this)
    this.closeModal = this.closeModal.bind(this)
  }

  // show modal
  showModal() {
    this.modal.current.openModal()
  }

  // close modal
  closeModal() {
    this.modal.current.closeModal()
  }

  // open tutorial page
  toGuidePage() {
    console.log('visit guide page')
  }

  render() {
    const { header, description } = this.props

    return (
      <Modal
        ref={this.modal}
        noCancel={true}>
        <div>
          <h4>{ header }</h4>
          <p style={{ 'fontSize': '12px' }}>
            {description}
          </p>
          <ListGroupItem className='d-flex justify-content-between align-items-center' style={{
            'margin': '10px 0',
            'borderRadius': '6px'
          }}>
            <div className='d-flex justify-content-between align-items-center'>
              <div style={{
                'backgroundColor': '#5255A5',
                'width': '10px',
                'height': '10px',
                'borderRadius': '50%',
                'marginBottom': '2px',
                'marginRight': '10px'
              }} />
              <p>Learn how to use Ethereum Studio</p>
            </div>

            <Button
              onClick={this.toGuidePage}
              color={'primary'}>
              Open
            </Button>
          </ListGroupItem>
          <div className='d-flex justify-content-between align-items-center'
            style={{'paddingTop': '30px'}}>
            <Button
              className='mx-auto '
              onClick={this.closeModal}
              color={'primary'}>
              Skip
            </Button>
          </div>
        </div>
      </Modal>
    )
  }
}
