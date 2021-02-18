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
        notification.success('Successful', `New project <b>${options.name}</b> is created.`)
      }
      return created
    } catch (e) {
      if (notify) {
        notification.error('Cannot Create the Project', e.message)
      }
      return false
    }
  }

  renderLocation = () => {
    if (platform.isWeb) {
      return null
    }

    let placeholder = 'Project path'
    if (!this.state.projectRoot) {
      placeholder = this.path.join(fileOps.current.workspace, this.state.name || '')
    }

    return (        
      <FormGroup>
        <Label>Project location</Label>
        <InputGroup>
          <Input
            placeholder={placeholder}
            value={this.state.projectRoot}
            onChange={e => this.setState({ projectRoot: e.target.value })}
          />
          <InputGroupAddon addonType='append'>
            <Button color='secondary' onClick={this.chooseProjectPath}>
              Choose...
            </Button>
          </InputGroupAddon>
        </InputGroup>
      </FormGroup>
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
        title='Create a New Project'
        textConfirm='Create Project'
        onConfirm={this.onCreateProject}
        pending={creating && 'Creating...'}
        confirmDisabled={!name || invalid}
      >
        {this.renderLocation()}
        <DebouncedFormGroup
          label='Project name'
          value={name}
          onChange={(name, invalid) => this.setState({ name, invalid })}
          {...projectNameProps}
        />
        <DropdownInput
          label='Template'
          options={templates}
          value={this.state.template}
          onChange={(template, group) => this.setState({ template, group })}
        />
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
