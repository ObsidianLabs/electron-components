import React, { PureComponent } from 'react'

import {
  Modal,
  FormGroup,
  Label,
  InputGroup,
  InputGroupAddon,
  Input,
  Button,
  DebouncedFormGroup,
  DropdownInput,
} from '@obsidians/ui-components'
import { t } from '@obsidians/i18n'

import platform from '@obsidians/platform'
import fileOps from '@obsidians/file-ops'
import notification from '@obsidians/notification'
import Terminal from '@obsidians/terminal'

import BaseProjectManager from '../ProjectManager/BaseProjectManager'
import actions from '../actions'

export default class NewProjectModal extends PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      name: '',
      invalid: false,
      projectRoot: '',
      template: props.defaultTemplate,
      group: props.defaultGroup,
      creating: false,
      showTerminal: false,
    }

    this.modal = React.createRef()
    this.terminal = React.createRef()
    this.path = fileOps.current.path
    this.fs = fileOps.current.fs

    actions.newProjectModal = this
  }

  openModal () {
    const { defaultTemplate, defaultGroup } = this.props
    this.setState({ template: defaultTemplate, group: defaultGroup, creating: false, showTerminal: false })
    this.modal.current.openModal()
    return new Promise(resolve => { this.onConfirm = resolve })
  }

  chooseProjectPath = async () => {
    try {
      const projectRoot = await fileOps.current.chooseFolder()
      this.setState({ projectRoot })
    } catch (e) {

    }
  }

  onCreateProject = async () => {
    this.setState({ creating: true })

    const { name, template, group } = this.state

    let projectRoot
    if (platform.isDesktop) {
      if (!this.state.projectRoot) {
        projectRoot = this.path.join(fileOps.current.workspace, name)
      } else if (!this.path.isAbsolute(this.state.projectRoot)) {
        projectRoot = this.path.join(fileOps.current.workspace, this.state.projectRoot)
      } else {
        projectRoot = this.state.projectRoot
      }
    }

    const created = await this.createProject({ projectRoot, name, template, group })

    if (created) {
      this.modal.current.closeModal()
      this.onConfirm(created)
      this.setState({ name: '', projectRoot: '', template: this.props.defaultTemplate, creating: false, showTerminal: false })
    } else {
      this.setState({ creating: false })
    }
  }

  async createProject ({ notify = true, ...options }) {
    try {
      const created = await BaseProjectManager.channel.invoke('post', '', options)
      if (notify) {
        notification.success(t('workspace.new.success'), t('workspace.new.successMessage', { name: options.name }))
      }
      return created
    } catch (e) {
      if (notify) {
        notification.error(t('workspace.error.createProject'), e.message)
      }
      return false
    }
  }

  renderLocation = () => {
    if (platform.isWeb) {
      return null
    }

    let placeholder = t('workspace.projectPath')
    if (!this.state.projectRoot) {
      placeholder = this.path.join(fileOps.current.workspace, this.state.name || '')
    }

    return (
      <FormGroup>
        <Label>{t('workspace.projectLocation')}</Label>
        <InputGroup>
          <Input
            placeholder={placeholder}
            value={this.state.projectRoot}
            onChange={e => this.setState({ projectRoot: e.target.value })}
          />
          <InputGroupAddon addonType='append'>
            <Button color='secondary' onClick={this.chooseProjectPath}>
              {t('button.choose')}...
            </Button>
          </InputGroupAddon>
        </InputGroup>
      </FormGroup>
    )
  }

  renderTemplate = () => {
    const { noTemplate, templates } = this.props
    if (noTemplate) {
      return null
    }
    return (
      <DropdownInput
        label={t('workspace.template')}
        options={templates}
        value={this.state.template}
        onChange={(template, group) => this.setState({ template, group })}
      />
    )
  }

  renderOtherOptions = () => {
    return null
  }

  render () {
    const { projectNameProps, templates } = this.props
    const { name, invalid, creating, showTerminal } = this.state

    return (
      <Modal
        ref={this.modal}
        overflow={!showTerminal}
        title={t('workspace.new.projectTitle')}
        textConfirm={t('workspace.new.project')}
        onConfirm={this.onCreateProject}
        pending={creating && `${t('creating')}...`}
        confirmDisabled={!name || invalid}
      >
        {this.renderLocation()}
        <DebouncedFormGroup
          label={t('workspace.projectName')}
          value={name}
          onChange={(name, invalid) => this.setState({ name, invalid })}
          {...projectNameProps}
        />
        {this.renderTemplate()}
        {this.renderOtherOptions()}
        <div style={{ display: showTerminal ? 'block' : 'none'}}>
          <Terminal
            ref={this.terminal}
            active={showTerminal}
            height='200px'
            logId='create-project'
            className='rounded overflow-hidden'
          />
        </div>
      </Modal>
    )
  }
}
