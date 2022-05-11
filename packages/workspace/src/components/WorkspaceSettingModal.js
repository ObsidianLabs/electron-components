import React, { PureComponent } from 'react'

import {
  Modal,
  FormGroup,
  Label,
  InputGroup,
  InputGroupAddon,
  Input,
  Button,
} from '@obsidians/ui-components'

import fileOps from '@obsidians/file-ops'
import redux from '@obsidians/redux'
import { t } from '@obsidians/i18n'

export default class WorkspaceSettingModal extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      projectRoot: ''
    }

    this.modal = React.createRef()
    this.path = fileOps.current.path
  }

  showModal() {
    const workspacePath = redux.getState().workspacePath
    const projectRoot = workspacePath ? workspacePath : this.path.join(fileOps.current.workspace, '')
    this.setState({
      projectRoot
    })
    this.forceUpdate()
    this.modal.current.openModal()
  }

  chooseProjectPath = async () => {
    try {
      const workspacePath = redux.getState().workspacePath
      const projectRoot = await fileOps.current.chooseFolder(workspacePath, 'openProject')
      redux.dispatch('SETTING_WORKSPACE_PATH', projectRoot)
      this.setState({ projectRoot })
    } catch (e) {

    }
  }

  renderProjectPath = () => {
    const { projectRoot } = this.state
    return (
      <FormGroup>
        <Label>{t('project.workspace')}</Label>
        <InputGroup className="pl-3 input-readonly-bg">
          <div className='d-inline-block hover-inline w-3'>
            <i className='fas fa-folder-open hover-inline-show' />
            <i className='fas fa-folder hover-inline-hide' />
          </div>
          <Input
            className='input-readonly-box-shadow'
            placeholder={projectRoot}
            value={projectRoot}
            readonly='readonly'
            onChange={e => this.setState({ projectRoot: e.target.value })}
          />
          <InputGroupAddon addonType='append'>
            <Button color='secondary' onClick={this.chooseProjectPath}>
              {t('project.change')}...
            </Button>
          </InputGroupAddon>
        </InputGroup>
      </FormGroup>
    )
  }

  render() {

    return (
      <Modal ref={this.modal} title={t('project.setting')}>
        {this.renderProjectPath()}
      </Modal>
    )
  }
}
