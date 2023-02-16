import React, { PureComponent } from 'react'

import {
  Modal,
  DebouncedFormGroup,
  Button
} from '@obsidians/ui-components'

import debounce from 'lodash/debounce'
import platform from '@obsidians/platform'
import Auth from '@obsidians/auth'
import { t } from '@obsidians/i18n'

import actions from '../actions'

class DeleteButton extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      type: t('project.del.title'),
      deleting: false,
      inputPlaceholder: '',
      name: '',
      projectName: '',
      projectRoot: '',
      confirmDisableStatus: true
    }
    this.modal = React.createRef()
    this.input = React.createRef()
  }

  openDeleteProjectModal = () => {
    const { projectManager } = this.props.context
    const inputPlaceholder = `请输入 ${platform.isWeb ? projectManager.projectRoot : projectManager.projectName} 以确认`
    this.setState({ projectRoot: projectManager.projectRoot, projectName: projectManager.projectName, deleting: false, inputPlaceholder, projectManager })
    setTimeout(() => this.input.current?.focus(), 100)
    this.modal.current.openModal()
  }

  changeVal = (name) => {
    const { projectName, projectRoot } = this.state
    const currentName = platform.isWeb ? projectRoot : projectName
    name = name.trim()
    const confirmDisableStatus = name != currentName
    this.setState({ name, confirmDisableStatus })
  }

  deleteProject = async () => {
    this.setState({ deleting: true })
    const { projectManager } = this.props.context
    const name = projectManager.projectName
    await projectManager.deleteProject()
    await actions.removeProject({ id: name, name, type: 'delete' })
    this.setState({ deleting: false })
    this.modal.current?.closeModal()
  }

  render () {
    const { projectManager, projectRoot } = this.props.context

    if (!projectManager.remote) {
      return null
    }

    if (!projectRoot.startsWith(`${Auth.username}/`)) {
      return null
    }

    return <>
      <h4 className='mt-4'>{t('project.del.others')}</h4>
      <Button color='danger' onClick={this.openDeleteProjectModal}>{t('project.del.title')}</Button>
      <Modal
        ref={this.modal}
        title={this.state.type}
        textConfirm={t('delete')}
        colorConfirm='danger'
        pending={this.state.deleting && t('deleting')}
        noCancel={true}
        headerCancelIcon={this.state.deleting}
        footerCancelIcon={this.state.deleting}
        confirmDisabled={this.state.confirmDisableStatus}
        onConfirm={this.deleteProject}
      >
        <DebouncedFormGroup
          ref={this.input}
          label={
            <div>
              {t('project.del.delText')}
              <div>{t('project.del.type')} <kbd>{platform.isWeb ? this.state.projectRoot : this.state.projectName}</kbd> {t('project.del.toConf')}</div>
            </div>
          }
          placeholder={this.state.inputPlaceholder}
          maxLength='100'
          value={this.state.name}
          onChange={this.changeVal}
        />
        <div 
          className='color-danger' 
          hidden={(!this.state.name || (this.state.name && !this.state.confirmDisableStatus))}
          >
          {t('project.del.tips')}
        </div>
      </Modal>
    </>
  }
}

export default class AbstractProjectSettingsTab extends PureComponent {
  static DeleteButton = DeleteButton

  onChangeHandlers = {}
  debouncedUpdate = debounce(() => this.forceUpdate(), 500, { leading: true, trailing: false }).bind(this)

  onChange = key => {
    if (!this.onChangeHandlers[key]) {
      this.onChangeHandlers[key] = value => {
        this.context.projectSettings?.set(key, value)
      }
    }
    return this.onChangeHandlers[key]
  }
}
