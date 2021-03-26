import React, { Component } from 'react'
import {
  Jumbotron,
  Container
} from 'reactstrap'

import { t } from '@obsidians/i18n'

export default class Invalid extends Component {
  render () {
    const fullName = this.props.eosProject.fullName
    return (
      <div className='custom-tab bg2'>
        <Jumbotron style={{ background: 'transparent' }} className='text-light'>
          <Container>
            <h1>{t('editor.project.invalid')}</h1>
            <hr className='my-2' />
            <p className='lead'>
              {t('editor.project.cantReadSetting')} <kbd>{fullName}</kbd>.
            </p>
            <p className='lead'>{t('editor.project.makeSurePermission')} <kbd>xxxx</kbd>.</p>
          </Container>
        </Jumbotron>
      </div>
    )
  }
}
