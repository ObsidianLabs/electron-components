import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import fileOps from '@obsidians/file-ops'

import { Treebeard, decorators, theme } from 'react-treebeard'

import TreeNodeContainer from './TreeNodeContainer'

import './styles.css'

theme.tree.base = {
  ...theme.tree.base,
  position: 'relative',
  display: 'block',
  background: 'transparent',
  fontFamily: 'inherit',
  paddingLeft: '12px',
  paddingRight: '12px',
  fontSize: '15px',
  minWidth: 'fit-content'
}
theme.tree.node.base = {}
theme.tree.node.activeLink = {
  background: 'red'
}
theme.tree.node.toggle.height = 10
theme.tree.node.toggle.width = 5
theme.tree.node.toggle.base = {
  ...theme.tree.node.toggle.base,
  marginLeft: '-24px'
}
theme.tree.node.toggle.wrapper = {
  ...theme.tree.node.toggle.wrapper,
  margin: 0,
  top: 0,
  left: '10px',
  height: '24px'
}
theme.tree.node.header.base = {
  ...theme.tree.node.header.base,
  color: undefined,
  position: 'relative'
}
theme.tree.node.subtree = {
  ...theme.tree.node.subtree,
  paddingLeft: '12px'
}

export default class FileTree extends PureComponent {
  static propTypes = {
    onSelect: PropTypes.func
  }

  state = {
    treeData: {},
    cursor: undefined
  }

  loaded = false
  loadedCallback = null

  componentDidMount () {
    this.props.projectManager.onRefreshDirectory(this.refreshDirectory)
    this.loadTree()
  }

  componentDidUpdate (prevProps) {
    // FIXME: how to know project has changed?
    if (prevProps.projectManager.projectRoot !== this.props.projectManager.projectRoot) {
      this.loadTree()
    }
  }
  
  componentWillUnmount () {
    this.props.projectManager.offRefreshDirectory()
  }

  loadTree = async () => {
    this.loaded = false

    const treeData = await this.props.projectManager.loadRootDirectory()
    treeData.toggled = true

    await this.setState({ treeData })
    this.loaded = true
    if (this.loadedCallback) {
      this.loadedCallback()
      this.loadedCallback = null
    }
  }

  onTreeLoaded = callback => {
    if (this.loaded) {
      callback()
      this.loadedCallback = null
    } else {
      this.loadedCallback = callback
    }
  }

  refreshDirectory = async ({ path, children }) => {
    const node = await this.findNode(path, [this.state.treeData])
    if (!node) {
      return
    }
    node.loading = false
    node.children = children
    if (this.state.cursor) {
      this.setActive(this.state.cursor.path)
    }
    this.forceUpdate()
  }

  loadDirectory = async node => {
    const children = await this.props.projectManager.loadDirectory(node.path)
    node.loading = false
    node.children = children
  }

  findNode = async (path, nodes) => {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]
      if (node.path === path) {
        return node
      } else if (node.children && path.startsWith(`${node.path}${fileOps.current.path.sep}`)) {
        node.toggled = true
        if (node.loading) {
          await this.loadDirectory(node)
        }
        return this.findNode(path, node.children)
      }
    }
  }

  get activeNode () {
    return this.state.cursor
  }

  setNoActive = () => {
    if (this.state.cursor) {
      this.state.cursor.active = false
      this.setState({ cursor: undefined })
    }
  }

  setActive = async path => {
    const node = await this.findNode(path, [this.state.treeData])
    if (!node) {
      this.setNoActive()
      return
    }
    if (this.state.cursor !== node) {
      this.onToggle(node, true)
    }
  }

  onToggle = async (node, toggled) => {
    if (this.state.cursor) {
      this.state.cursor.active = false
    }
    node.active = true
    if (node.children) {
      node.toggled = toggled
      if (toggled) {
        await this.loadDirectory(node)
      }
    }
    this.setState({ cursor: node })
    await this.forceUpdate()
    if (!node.children && this.props.onSelect) {
      this.props.onSelect(node.path)
    }
  }

  render () {
    if (!Object.keys(this.state.treeData).length) {
      return (
        <span key='loading' className='mx-1 text-muted'>
          <i className='fas fa-spin fa-spinner mr-1' />Loading...
        </span>
      )
    }

    decorators.Container = props => {
      let contextMenu = this.props.contextMenu
      if (typeof contextMenu === 'function') {
        contextMenu = contextMenu(props.node)
      }
      return (
        <TreeNodeContainer
          {...props}
          contextMenu={contextMenu}
          readonly={this.props.readonly}
        />
      )
    }

    return (
      <div className='d-flex align-items-stretch flex-column h-100' style={{ overflowY: 'auto' }}>
        <Treebeard
          style={theme}
          data={this.state.treeData}
          decorators={decorators}
          onToggle={this.onToggle}
        />
      </div>
    )
  }
}
