import React, { useEffect, useState, useRef } from 'react'
import Tree from 'rc-tree'
import cloneDeep from 'lodash/cloneDeep'
import debounce from 'lodash/debounce'
import './styles.css'
import { Menu, Item, useContextMenu, Separator } from 'react-contexify'
import 'react-contexify/dist/ReactContexify.min.css'
import platform from '@obsidians/platform'
import StatusTitle from './statusTitle'
import { travelTree,
  updateErrorInfo,
  findFather } from './helper'
import { modelSessionManager } from '@obsidians/code-editor'

const renderIcon = ({ data }) => {
  if (data.isLeaf) {
    return <i className='fas fa-file-code fa-fw mr-1' />
  }
}

const renderSwitcherIcon = ({ loading, expanded, data }) => {
  if (loading && !data.isLeaf) {
    return <span key='loading'><span className='fas fa-sm fa-spin fa-spinner fa-fw' /></span>
  }

  if (data.isLeaf) {
    return null
  }

  return expanded ? (
    <span key='switch-expanded'><span className='far fa-chevron-down fa-fw' /></span>
  ) : (
    <span key='switch-close'><span className='far fa-chevron-right fa-fw' /></span>
  )
}

const allowDrop = (props) => {
  const { dropNode, dragNode, dropPosition, enableCopy } = props

  if (dropPosition === -1) return false

  if (enableCopy) {
    return true
  }

  if (!dropNode.children && !dragNode.children && (dropNode.path.replace(dropNode.name, '') === dragNode.path.replace(dragNode.name, ''))) {
    return false
  }

  return true
}

const setLeaf = (treeData, curKey) => {
  const loopLeaf = (data) => {
    data.forEach(item => {
      if (!item.key) {
        item.key = item.path
      }
      if (!item.title) {
        item.title = item.name
      }
      if (
        item.path.length > curKey.length
          ? item.path.indexOf(curKey) !== 0
          : curKey.indexOf(item.path) !== 0
      ) {
        return
      }
      if (item.children) {
        loopLeaf(item.children)
      } else if (!item.children || item.children.length === 0) {
        item.isLeaf = true
      }
    })
  }
  loopLeaf(treeData)
}

const getNewTreeData = (treeData, curKey, child) => {
  const loop = data => {
    data.forEach(item => {
      if (curKey.indexOf(item.path) === 0) {
        if (item.children?.length > 0) {
          loop(item.children)
        } else {
          item.children = child
        }
      }
    })
  }
  loop(treeData)
  setLeaf(treeData, curKey)
}

const replaceTreeNode = (treeData, curKey, child) => {
  const loop = data => {
    data.forEach(item => {
      if (curKey === item.path) {
        item.children = child
      } else if (item.root && curKey.replace(/^(public|private)\//, '') === item.path.replace(/^(public|private)\//, '')) {
        item.path = curKey
        item.children = child
      }
      else if (item.children) {
        loop(item.children)
      }
    })
  }
  loop(treeData)
}

const FileTree = ({ projectManager, onSelect, contextMenu, readOnly = false }, ref) => {
  const treeRef = React.useRef()
  const [treeData, setTreeData] = useState([])
  const [autoExpandParent, setAutoExpandParent] = useState(true)
  const [expandedKeys, setExpandKeys] = useState([])
  const [selectedKeys, setSelectedKeys] = useState([])
  const [selectNode, setSelectNode] = useState(null)
  const [enableCopy, setEnableCopy] = useState(false)
  const [dragTarget, setDragTarget] = useState('')
  const [prevDragEnter, setPrevDragEnter] = useState('')
  const [fatherNode, setFatherNode] = useState('')
  const prevTreeData = useRef()
  const [isBlankAreaRightClick, setIsBlankAreaRightClick] = useState(false)
  const [isTreeDataRoot, setIsTreeDataRoot] = useState(false)
  prevTreeData.current = treeData
  let treeNodeContextMenu = typeof contextMenu === 'function' ? contextMenu(selectNode) : contextMenu

  if (readOnly) {
    // only leave the "Copy Path" feature
    // TODO we need a id to make sure the filter works correctlly
    treeNodeContextMenu = treeNodeContextMenu.filter(item => item && item.text === 'Copy Path')
  } else {
    isBlankAreaRightClick && (treeNodeContextMenu = treeNodeContextMenu.filter(item => item && (item.text === 'New File' || item.text === 'New Folder')))

    // Removing rename and delete operations from the root of the file tree
    if (!isBlankAreaRightClick && isTreeDataRoot) {
      const renameAndDeleteText = ['Rename', 'Delete']
      treeNodeContextMenu = treeNodeContextMenu.filter(item => {
        return item ? !renameAndDeleteText.includes(item.text) : treeNodeContextMenu.push(null)
      })
      !treeNodeContextMenu.slice(-1)[0] && treeNodeContextMenu.pop()
    }

    const { show } = useContextMenu({
      id: 'file-tree'
    })

    const handleContextMenu = ({ event, node }) => {
      node.root ? setIsTreeDataRoot(true) : setIsTreeDataRoot(false)
      event.nativeEvent.preventDefault()
      event.stopPropagation()
      setIsBlankAreaRightClick(false)

      handleSetSelectNode(node)
      show(event.nativeEvent, {
        props: {
          key: 'value'
        }
      })
    }

    const handleEmptyTreeContextMenu = (event) => {
      setIsBlankAreaRightClick(true)
      handleSetSelectNode(treeData[0])
      show(event.nativeEvent, {
        props: {
          key: 'value'
        }
      })
    }

    const renderTitle = (curNode, errorNode) => {
      if (curNode.name === 'build') return true
      const matchedValue = errorNode[curNode.name]
      if (!matchedValue) return
      matchedValue.type === 'default' ? curNode.title = curNode.name
        : curNode.title = (<StatusTitle
          title={curNode.name}
          isLeaf={matchedValue.isLeaf}
          showType={matchedValue.type}
          count={matchedValue.count} />)
    }

    const updateTitle = (treeData) => {
      const rawDecoration = modelSessionManager.decorationMap
      console.log('rawDecoration', rawDecoration)
      const hasError = Object.keys(rawDecoration).length !== 0
      if (!hasError) {
        return
      }
      const errorNode = updateErrorInfo(rawDecoration, treeData.key)
      console.log('errorNode', errorNode)
      travelTree(treeData, renderTitle, errorNode)
      setTreeData([treeData])
    }

    useEffect(() => {
      loadTree(projectManager)
    }, [])

    const handleSetSelectNode = (node) => {
      setSelectNode(node)
    }

    React.useImperativeHandle(ref, () => ({
      setActive(key) {
        if (!selectedKeys.includes(key)) {
          setSelectedKeys([key])
        }
      },
      setNoActive() {
        setSelectedKeys([])
      },
      get activeNode() {
        return selectNode
      },
      get rootNode() {
        return treeData
      },
      updateTreeTitle() {
        updateTitle(...treeData)
      }
    }))

    const fileOps = async (from, to) => {
      if (enableCopy) {
        await projectManager.copyOps({ from, to })
      } else {
        await projectManager.moveOps({ from, to })
      }
    }

    const loadTree = async projectManager => {
      projectManager.onRefreshDirectory(refreshDirectory)
      const treeData = await projectManager.loadRootDirectory()
      setLeaf([treeData], treeData.path)

      setTreeData([treeData])
      setSelectNode(treeData)
      setExpandKeys([treeData.path])
      treeRef.current && (treeRef.current.state.loadedKeys = [])
    }

    const refreshDirectory = async (directory) => {
      const { prefix, projectId, userId } = projectManager
      if (directory.path === `${prefix}/${userId}/${projectId}`) {
        await loadTree(projectManager)
      } else {
        const tempTree = cloneDeep(prevTreeData.current)
        if (!directory) {
          return
        }

        replaceTreeNode(tempTree, directory.path, directory.children)
        setLeaf(tempTree, tempTree[0].path)
        setTreeData(tempTree)
        setSelectNode(tempTree[0])
      }
    }

    const handleLoadData = treeNode => {
      return new Promise(async (resolve, reject) => {
        !treeNode.children && resolve()
        const tempTreeData = cloneDeep(treeData)
        try {
          const newData = await projectManager.loadDirectory(treeNode)
          newData.length === 0 && resolve()
          getNewTreeData(tempTreeData, treeNode.path, newData)
          setTreeData(tempTreeData)
          updateTitle(...tempTreeData)
          setTimeout(resolve, 100)
        } catch (e) {
          reject(e)
        }
      })
    }

    const handleSelect = (_, { node }) => {
      node.isLeaf && onSelect(node)
    }

    const handleExpand = (keys, { node }) => {
      if (node.root || !!dragTarget) {
        return
      }
      setAutoExpandParent(false)
      setExpandKeys(keys)
      setSelectNode(node)
    }

    const expandFolderNode = (event, node) => {
      if (node.isLeaf) {
        return
      }

      if (treeRef.current) {
        treeRef.current.onNodeExpand(event, node)
        setSelectNode(node)
      }
    }

    const enableHighLightBlock = (tree, needHighLight) => {
      const refreshClassName = (node) => {
        if (node.name === fatherNode.name) {
          node.className = needHighLight ? 'father--disable node--highlight' : 'father--disable'
          return
        }
        node.className = needHighLight ? 'node--highlight' : ''
      }
      travelTree(tree, refreshClassName)
    }

    const handleDragStart = ({ event, node }) => {
      travelTree(...treeData, changeOwnFather, node) // disable father node style
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.dropEffect = 'move'
      event.currentTarget.id = 'drag--active'
      setEnableCopy(event.altKey)
    }

    const handleDragEnter = ({ event, node }) => {
      prevDragEnter && enableHighLightBlock(prevDragEnter, false)
      travelTree(...treeData, changeNewFather, node)
    }

    const handleDragEnd = ({ event, node }) => {
      enableHighLightBlock(...treeData, false)
      travelTree(...treeData, changeOwnFather, dragTarget) // enable father node style
      event.currentTarget.id = ''
    }

    const handleDrop = ({ node, dragNode }) => {
      fileOps(dragNode.path, node.path)
    }

    const handleMouseEnter = ({ event }) => {
      if (!dragTarget) {
        event.currentTarget.parentElement.id = 'hover--active'
      }
    }

    const handleMouseLeave = ({event}) => {
      event.currentTarget.parentElement.id = ''
    }

    const handleClick = (event, node) => {
      console.log('click', node.name)
      onDebounceExpand(event, node)
    }

    const onDebounceExpand = debounce(expandFolderNode, 200, { leading: true })

    const onDebounceDrop = debounce(handleDrop, 200, { leading: true })

    const onDebounceDrag = debounce(handleDragEnter, 100)

    const disableFather = (node, targetNode) => {
      if (!node.className || !node.className.includes('father--disable')) {
        node.className = 'father--disable'
        setDragTarget(targetNode)
        setFatherNode(node)
      } else {
        node.className = ''
        setDragTarget('')
        setFatherNode('')
      }
    }

    const enableFather = (node, enterNode) => {
      if ([fatherNode.name, dragTarget.name].includes(enterNode.name)) return
      if (enterNode.isLeaf) {
        enableHighLightBlock(node, true)
        setPrevDragEnter(node)
      } else {
        const isExist = expandedKeys.includes(enterNode.path)
        const newKeys = isExist ? expandedKeys : [...expandedKeys, enterNode.path]
        setExpandKeys(newKeys)
      }
    }

    const changeOwnFather = findFather(disableFather)

    const changeNewFather = findFather(enableFather)

    return (
      <div className='tree-wrap animation'
        onContextMenu={handleEmptyTreeContextMenu}
      >
        <Tree
          // TODO: improve the condition when support the WEB
          draggable={!platform.isWeb}
          allowDrop={(props) => allowDrop({ ...props, enableCopy })}
          onDrop={onDebounceDrop}
          ref={treeRef}
          itemHeight={20}
          icon={renderIcon}
          treeData={treeData}
          dropIndicatorRender={() => null}
          loadData={handleLoadData}
          expandedKeys={expandedKeys}
          selectedKeys={selectedKeys}
          autoExpandParent={autoExpandParent}
          switcherIcon={(nodeProps) =>
            renderSwitcherIcon(nodeProps)
          }
          onRightClick={handleContextMenu}
          onClick={handleClick}
          onExpand={handleExpand}
          onSelect={handleSelect}
          onDragStart={handleDragStart}
          onDragEnter={onDebounceDrag}
          onDragEnd={handleDragEnd}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        />
        <Menu animation={false} id='file-tree'>
          {
            treeNodeContextMenu.map((item, index) => item ? <Item key={item.text} onClick={() => item.onClick(selectNode)}>{item.text}</Item> : <Separator key={`blank-${index}`} />)
          }
        </Menu>
      </div>
    )
  }
}

const ForwardFileTree = React.forwardRef(FileTree)
ForwardFileTree.displayName = 'FileTree'

export default ForwardFileTree

// TOOD: refactor the dir contruct of the service
export { default as ClipBoardService } from './clipboard'
