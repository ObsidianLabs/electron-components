import React, { Component } from 'react'
import { t } from '@obsidians/i18n'

export default class Settings extends Component {
  render () {
    return (
      <div className='custom-tab bg2'>
        <div className='jumbotron bg-transparent text-body'>
          <div className='container'>
            <h1>{t('editor.project.setting')}</h1>
          </div>
        </div>
      </div>
    )
  }
}
