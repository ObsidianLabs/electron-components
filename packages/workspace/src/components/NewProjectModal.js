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
import { IpcChannel } from '@obsidians/ipc'
import Terminal from '@obsidians/terminal'

import actions from '../actions'

export default class NewProjectModal extends PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      name: '',
      projectRoot: '',
      template: props.defaultTemplate,
      creating: false,
      showTerminal: false,
    }

    this.modal = React.createRef()
    this.terminal = React.createRef()
    this.path = fileOps.current.path
    this.fs = fileOps.current.fs
    this.channel = new IpcChannel('project')

    actions.newProjectModal = this
  }

  openModal () {
    this.setState({ creating: false, showTerminal: false })
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

    const { name, template } = this.state

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

    const created = await this.createProject({ projectRoot, name, template })

    if (created) {
      this.modal.current.closeModal()
      this.onConfirm(created)
      this.setState({ name: '', projectRoot: '', template: this.props.defaultTemplate, creating: false, showTerminal: false })
    } else {
      this.setState({ creating: false })
    }
  }

  async createProject ({ projectRoot, name, template }) {
    try {
      const created = await this.channel.invoke('post', '', { projectRoot, name, template })
      notification.success('Successful', `New project <b>${name}</b> is created.`)
      return created
    } catch (e) {
      notification.error('Cannot Create the Project', e.message)
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
    const { templates } = this.props
    const { name, creating, showTerminal } = this.state

    return (
      <Modal
        ref={this.modal}
        overflow
        title='Create a New Project'
        textConfirm='Create Project'
        onConfirm={this.onCreateProject}
        pending={creating && 'Creating...'}
        confirmDisabled={!name}
      >
        {this.renderLocation()}
        <DebouncedFormGroup
          label='Project name'
          onChange={name => this.setState({ name })}
        />
        <DropdownInput
          label='Template'
          options={templates}
          value={this.state.template}
          onChange={template => this.setState({ template })}
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
