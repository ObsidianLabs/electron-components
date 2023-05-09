import React, { useEffect, useState, useRef, forwardRef } from 'react'
import Tree from 'rc-tree'
import cloneDeep from 'lodash/cloneDeep'
import debounce from 'lodash/debounce'
import './styles.css'
import { Menu, Item, useContextMenu, Separator } from 'react-contexify'
import 'react-contexify/dist/ReactContexify.min.css'
import StatusTitle from './statusTitle'
import { travelTree,
  updateErrorInfo,
  findFather,
  findChildren,
  filterDuplicate } from './helper'
import { modelSessionManager } from '@obsidians/code-editor'
import PropTypes from 'prop-types'
import useBatchLoad from './hooks/useBatchLoad'
import { useHotkeys } from 'react-hotkeys-hook'

let disableSetActive = false // stop useless setActive function when filetree trigger onSelect event

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
    <span key='switch-expanded'><span className='fas fa-chevron-down fa-fw' /></span>
  ) : (
    <span key='switch-close'><span className='fas fa-chevron-right fa-fw' /></span>
  )
}

const allowDrop = (props) => {
  const { dropNode, dragNode, dropPosition } = props
  if (dropPosition === -1) return false

  return !(!dropNode.children && !dragNode.children && (dropNode.path.replace(dropNode.name, '') === dragNode.path.replace(dragNode.name, '')))
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
      if (item.path.length > curKey.length
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
        item.children?.length > 0
            ? loop(item.children)
            : item.children = item.key === curKey ? child : []
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
      } else if (item.children) {
        loop(item.children)
      }
    })
  }
  loop(treeData)
}

const FileTree = forwardRef(({ projectManager, onSelect, move, copy, initialPath, contextMenu, readOnly = false }, ref) => {
  const treeRef = React.useRef()
  const [treeData, setTreeData] = useState([])
  const [autoExpandParent, setAutoExpandParent] = useState(true)
  const [expandedKeys, setExpandKeys] = useState([])
  const [selectedKeys, setSelectedKeys] = useState([initialPath])
  const [persistDOM, setPersist] = useState(null)
  const [selectNode, setSelectNode] = useState(null)
  const [rightClickNode, setRightClikNode] = useState(null)
  const [moveNode, setMoveNode] = useState(null)
  const [copyNode, setCopyNode] = useState(null)
  const [isCopy, setIsCopy] = useState(true)
  const [dragTarget, setDragTarget] = useState('')
  const [prevDragEnter, setPrevDragEnter] = useState('')
  const [fatherNode, setFatherNode] = useState('')
  const cacheTreeData = useRef()
  cacheTreeData.current = treeData
  const [isBlankAreaRightClick, setIsBlankAreaRightClick] = useState(false)
  const [isTreeDataRoot, setIsTreeDataRoot] = useState(false)

  let treeNodeContextMenu = typeof contextMenu === 'function' ? contextMenu(rightClickNode) : contextMenu

  if (readOnly) {
    // only leave the "Copy Path" feature
    // TODO we need a id to make sure the filter works correctly
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
  }

  const { show, hideAll } = useContextMenu({
    id: 'file-tree'
  })

  React.useImperativeHandle(ref, () => ({
    setActive(key) {
      if (!key) {
        setSelectedKeys([])
        setSelectNode(null)
        return
      }
      handleSetActive(key)
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

  useEffect(async () => {
    await initTree()
  }, [])

  const handleContextMenu = ({ event, node }) => {
    node.root ? setIsTreeDataRoot(true) : setIsTreeDataRoot(false)
    addPersist(event)
    event.nativeEvent.preventDefault()
    event.stopPropagation()
    setIsBlankAreaRightClick(false)
    setRightClikNode(node)
    show(event.nativeEvent, {
      props: {
        key: 'value'
      }
    })
  }

  const handleEmptyTreeContextMenu = (event) => {
    if (event.target.className.includes('react-contexify')) return
    setIsBlankAreaRightClick(true)
    setRightClikNode(treeData[0])
    removePersist()
    show(event.nativeEvent, {
      props: {
        key: 'value'
      }
    })
  }

  const handleMenuItemClick = (item) => {
    return ({ event }) => {
      item.onClick(rightClickNode)
      event.stopPropagation()
      hideAll()
    }
  }

  const renderMenu = (treeNodeContextMenu) => {
    return (
        treeNodeContextMenu.map((item, index) => item
          ? <Item key={item.text}
            onClick={handleMenuItemClick(item)}>{item.bilingualText}</Item>
          : <Separator key={`blank-${index}`} />)
      )
  }

  const removePersist = () => {
    if (persistDOM) {
      persistDOM.className = persistDOM.className.toString().replace(' persist--active', '')
      setPersist(null)
    }
  }

  const addPersist = (event) => {
    removePersist()
    event.currentTarget.parentElement.className += ' persist--active'
    setPersist(event.currentTarget.parentElement)
  }

  const rootClick = () => {
    removePersist()
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
    const hasError = Object.keys(rawDecoration).length !== 0
    if (!hasError) return
    const errorNode = updateErrorInfo(rawDecoration, treeData.key)
    travelTree(treeData, renderTitle, errorNode)
    setTreeData([treeData])
  }

  const refreshDirectory = async (directory) => {
    if (!directory) return
    const { prefix, projectId, userId } = projectManager
    if (directory.path === `${prefix}/${userId}/${projectId}`) { // update whole tree data
      await fetchTreeData()
    } else {  // update partial tree data
      if (!directory) return
      const tempTree = cloneDeep(cacheTreeData.current)
      replaceTreeNode(tempTree, directory.path, directory.children)
      setLeaf(tempTree, tempTree[0].path)
      setTreeData(tempTree)
    }
  }

  const initTree = async () => {
    projectManager.onRefreshDirectory(refreshDirectory) // register refreshDirectory event to BaseProjectManager
    await fetchTreeData(true)
  }

  const fetchTreeData = async (initFetch = false) => {
    const treeData = await projectManager.loadRootDirectory()
    setLeaf([treeData], treeData.path)
    setTreeData([treeData])
    setExpandKeys([treeData.path])
    treeRef.current && (treeRef.current.state.loadedKeys = [])
    if (initFetch) {
      setSelectedKeys([initialPath])
      setSelectNode(findChildren(treeData, initialPath))
    }
  }

  const handleClick = (event, node) => {
    disableSetActive = node.isLeaf
    onDebounceClick(event, node)
  }

  const clickFolderNode = (event, node) => {
    setSelectNode(node)
    setSelectedKeys([node.path])
    if (node.isLeaf) return
    if (treeRef.current) {
      treeRef.current.onNodeExpand(event, node)
    }
  }

  const handleExpand = (keys, { node }) => {
    if (node.root || !!dragTarget || node.isLeaf) return
    setAutoExpandParent(false)
    setExpandKeys(keys)
    setSelectNode(node)
  }

  const handleSetActive = (activeKey) => {
    if (disableSetActive) {
      disableSetActive = false
      return
    }

    const findNodeByKey = (curNode, nodeKey) => {
      let stop = false
      if (curNode.path === nodeKey) {
        setSelectNode(curNode)
        if (!expandedKeys.includes(curNode.fatherPath)) {
          setExpandKeys([...expandedKeys, curNode.fatherPath])
        }
        stop = true
      }
      return stop
    }
    !selectedKeys.includes(activeKey) && setSelectedKeys([activeKey])
    !selectNode.path !== activeKey && travelTree(...treeData, findNodeByKey, activeKey)
  }

  const handleSelect = (_, { node }) => {
    setSelectNode(node)
    node.isLeaf && onSelect(node)
  }

  const handleLoadData = useBatchLoad({
    treeData: cacheTreeData.current,
    projectManager,
    getNewTreeData,
    setTreeData
  })

  const enableHighLightBlock = (tree, needHighLight) => {
    const refreshClassName = (node) => {
      if (node.path === fatherNode.path) {
        node.className = needHighLight ? 'father--disable node--highlight' : 'father--disable'
        return
      }
      node.className = needHighLight ? 'node--highlight' : ''
    }
    travelTree(tree, refreshClassName)
  }

  const handleDragStart = ({ event, node }) => {
    travelTree(...treeData, changeOwnFather, node) // disable father node style
    event.dataTransfer.effectAllowed = 'copyMove'
    event.currentTarget.id = 'drag--active'
    event.dataTransfer.setDragImage(event.target, 3, 5)
  }

  const handleDragEnter = ({ event, node }) => {
    prevDragEnter && enableHighLightBlock(prevDragEnter, false)
    travelTree(...treeData, changeNewFather, node)
  }

  const handleDragOver = ({ event }) => {
    if (projectManager.remote) return
    setIsCopy(event.altKey)
    event.dataTransfer.dropEffect = event.altKey ? 'copy' : 'move'
  }

  const handleDragEnd = ({ event, node }) => {
    enableHighLightBlock(...treeData, false)
    resetOwnFather(fatherNode) // reset father node style
    event.currentTarget.id = ''
    setIsCopy(false)
  }

  const handleDrop = ({ node, dragNode }) => {
    if (node.path === dragNode.path) return
    isCopy
       ? copy(dragNode, node, true)
          : move(dragNode, node)
  }

  const handleMouseEnter = ({ event }) => {
    if (!dragTarget) {
      event.currentTarget.parentElement.id = 'hover--active'
    }
  }

  const handleMouseLeave = ({event}) => {
    event.currentTarget.parentElement.id = ''
  }

  const disableFather = (node, targetNode) => {
    node.className = 'father--disable'
    setDragTarget(targetNode)
    setFatherNode(node)
  }

  const resetOwnFather = (node) => {
    node.className = ''
    setDragTarget('')
    setFatherNode('')
  }

  const enableFather = (node, enterNode) => {
    if ([fatherNode.path, dragTarget.path].includes(enterNode.path)) return
    if (enterNode.isLeaf) {
      enableHighLightBlock(node, true)
      setPrevDragEnter(node)
    } else {
      const isExist = expandedKeys.includes(enterNode.path)
      const newKeys = isExist ? expandedKeys : [...expandedKeys, enterNode.path]
      setExpandKeys(newKeys)
    }
  }

  const findEvent = (name) => treeNodeContextMenu.find(item => item && item.text === name)

  useHotkeys('ctrl+del, cmd+backspace', () => {
    const deleteEvent = findEvent('Delete')
    deleteEvent.onClick(selectNode)
  }, [treeNodeContextMenu, selectNode])

  useHotkeys('ctrl+x, cmd+x', () => {
    if (projectManager.remote) return
    setMoveNode(selectNode)
    setCopyNode(null)
  }, [treeNodeContextMenu, selectNode, copyNode])

  useHotkeys('ctrl+c, cmd+c', () => {
    if (projectManager.remote) return
    setCopyNode(selectNode)
    setMoveNode(null)
  }, [treeNodeContextMenu, selectNode, copyNode, selectedKeys])

  useHotkeys('ctrl+v, cmd+v', () => {
    if (projectManager.remote) return
    if (moveNode && !moveNode.root && selectNode.path !== moveNode.path) { // handle move event
      move(moveNode, selectNode)
      setMoveNode(null)
      return
    }

    if (copyNode && !copyNode.root) { // handle copy event
      const sameNode = copyNode.path === selectNode.path
      sameNode
            ? copy(copyNode) // handle copy event without given a new path of copied file
            : copy(copyNode, selectNode, true) // handle copy event with given a new path of copied file
    }
    setExpandKeys(filterDuplicate([...expandedKeys, selectNode.key]))
  }, [treeNodeContextMenu, copyNode, selectNode, expandedKeys])

  const onDebounceClick = debounce(clickFolderNode, 200, { leading: true })

  const onDebounceDrop = debounce(handleDrop, 200, { leading: true })

  const onDebounceDrag = debounce(handleDragEnter, 100)

  const changeOwnFather = findFather(disableFather)

  const changeNewFather = findFather(enableFather)

  return (
    <div className='tree-wrap animation'
      onClick={rootClick}
      onContextMenu={handleEmptyTreeContextMenu}>
      <Tree
          // TODO: improve the condition when support the WEB
        draggable={!projectManager.remote}
        allowDrop={(props) => allowDrop({ ...props })}
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
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        />
      <Menu animation={false} id='file-tree'>
        { renderMenu(treeNodeContextMenu) }
      </Menu>
    </div>
    )
})

export default FileTree

FileTree.propTypes = {
  projectManager: PropTypes.object,
  onSelect: PropTypes.func,
  initialPath: PropTypes.string,
  contextMenu: PropTypes.object,
  readOnly: PropTypes.func,
  copy: PropTypes.func,
  move: PropTypes.func
}

// TOOD: refactor the dir contruct of the service
export { default as ClipBoardService } from './clipboard'
