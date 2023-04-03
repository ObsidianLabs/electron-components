import React, { PureComponent } from 'react'

import {
  Modal,
  ButtonOptions,
  FormGroup,
  Label,
  InputGroup,
  InputGroupAddon,
  Input,
  Button,
  DebouncedFormGroup,
  DropdownInput,
} from '@obsidians/ui-components'

import platform from '@obsidians/platform'
import fileOps from '@obsidians/file-ops'
import Auth from '@obsidians/auth'
import notification from '@obsidians/notification'
import Terminal from '@obsidians/terminal'
import redux from '@obsidians/redux'
import { t } from '@obsidians/i18n'
import ProjectManager from '../ProjectManager'
import actions from '../actions'

export default class NewProjectModal extends PureComponent {
  constructor(props) {
    super(props)

    const workspacePath = redux.getState().workspacePath
    this.state = {
      remote: platform.isWeb,
      name: '',
      invalid: false,
      projectRoot: '',
      template: props.defaultTemplate,
      group: props.defaultGroup,
      creating: false,
      showTerminal: false,
      workspacePath
    }

    this.modal = React.createRef()
    this.terminal = React.createRef()
    this.path = fileOps.current.path
    this.fs = fileOps.current.fs

    actions.newProjectModal = this
  }

  openModal(remote) {
    const { defaultTemplate, defaultGroup } = this.props
    const workspacePath = redux.getState().workspacePath
    this.setState({
      remote,
      template: defaultTemplate,
      group: defaultGroup,
      creating: false,
      showTerminal: false,
      workspacePath,
    })
    this.forceUpdate()
    this.modal.current.openModal()
    return new Promise(resolve => { this.onConfirm = resolve })
  }

  chooseProjectPath = async () => {
    try {
      const { workspacePath } = this.state
      const projectRoot = await fileOps.current.chooseFolder(workspacePath, 'openProject')
      this.setState({ projectRoot })
    } catch (e) {

    }
  }

  onCreateProject = async () => {
    this.setState({ creating: true })

    const { remote, name, template, group, workspacePath } = this.state

    let projectRoot
    if (!remote) {
      if (!this.state.projectRoot) {
        projectRoot = this.path.join(workspacePath ? workspacePath : fileOps.current.workspace, name)
      } else if (!this.path.isAbsolute(this.state.projectRoot)) {
        projectRoot = this.path.join(fileOps.current.workspace, this.state.projectRoot)
      } else {
        projectRoot = this.state.projectRoot
      }
    }

    const created = await this.createProject({ projectRoot, name, template, group })

    if (created) {
      this.modal.current?.closeModal()
      this.onConfirm(created)
      this.setState({ name: '', projectRoot: '', template: this.props.defaultTemplate, creating: false, showTerminal: false })
    } else {
      this.setState({ creating: false })
    }
  }

  async createProject({ notify = true, ...options }, stage = '') {
    try {
      const Manager = this.state.remote ? ProjectManager.Remote : ProjectManager.Local
      const created = await Manager.createProject(options, stage)
      if (notify) {
        notification.success(t('project.success'), t('project.successText', {name: options.name}))
      }
      return created
    } catch (e) {
      // if (notify) {
      notification.error(t('project.cannotCreate'), e.message)
      // }
      return false
    }
  }

  renderLocation = () => {
    if (platform.isDesktop && Auth.username) {
      return (
        <div>
          <ButtonOptions
            className='mb-3'
            options={[
              { key: 'local', text: 'Local', icon: 'far fa-desktop mr-1' },
              { key: 'cloud', text: 'Cloud', icon: 'far fa-cloud mr-1' },
            ]}
            selected={this.state.remote ? 'cloud' : 'local'}
            onSelect={key => this.setState({ remote: key === 'cloud' })}
          />
        </div>
      )
    }
    return null
  }

  renderProjectPath = () => {
    const { workspacePath, projectRoot, remote, name } = this.state
    if (remote) {
      return null
    }

    let placeholder = 'Project path'
    if (!projectRoot) {
      placeholder = workspacePath ? workspacePath : this.path.join(fileOps.current.workspace, name || '')
    }

    return (
      <FormGroup>
        <Label>{t('project.location')}</Label>
        <InputGroup>
          <Input
            placeholder={placeholder}
            value={projectRoot}
            onChange={e => this.setState({ projectRoot: e.target.value })}
          />
          <InputGroupAddon addonType='append'>
            <Button color='secondary' onClick={this.chooseProjectPath}>
              {t('project.choose')}...
            </Button>
          </InputGroupAddon>
        </InputGroup>
      </FormGroup>
    )
  }

  renderTemplate() {
    const { noTemplate, templates } = this.props
    const { remote, template } = this.state
    if (noTemplate) {
      return null
    }
    return (
      <DropdownInput
        label={t('project.template')}
        options={templates.filter(t => !remote || !t.local)}
        placeholder='请选择一个模版'
        value={template}
        onChange={(template, group) => this.setState({ template, group })}
      />
    )
  }

  renderOtherOptions = () => null

  render() {
    const { projectNameProps, templates } = this.props
    const { name, invalid, creating, showTerminal } = this.state

    return (
      <Modal
        className='new-project-modal'
        ref={this.modal}
        title={t('project.title')}
        textConfirm={t('project.textConfirm')}
        onConfirm={this.onCreateProject}
        pending={creating && `${t('keypair.creating')}...`}
        confirmDisabled={!name || invalid || !/^[0-9a-zA-Z\-_]*$/.test(name)}
        scrollable={false}
      >
        {this.renderLocation()}
        {this.renderProjectPath()}
        <DebouncedFormGroup
          label={t('project.name')}
          value={name}
          onChange={(name, invalid) => this.setState({ name, invalid })}
          {...projectNameProps}
        />
        {this.renderTemplate()}
        {this.renderOtherOptions()}
        <div style={{ display: showTerminal ? 'block' : 'none' }}>
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
