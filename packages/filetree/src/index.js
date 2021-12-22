import React, { useCallback, useEffect, useState, useRef } from 'react'
import Tree from 'rc-tree'
import cloneDeep from 'lodash/cloneDeep'
import debounce from 'lodash/debounce'
import './styles.css'

const renderIcon = (props) => {
  const { data } = props;
  if (!data.children) {
    return <i className='fas fa-file-code fa-fw mr-1' />
  }
};

const renderSwitcherIcon = ({ loading, expanded, data }) => {
  if (loading && data.children) {
    return <span key='loading'><span className='fas fa-sm fa-spin fa-spinner  fa-fw' /></span>
  }

  if (!data.children) {
    return null;
  }

  return expanded ? (
    <span key='switch-expanded'><span className='far fa-sm fa-chevron-down fa-fw' /></span>
  ) : (
    <span key='switch-close'><span className='far fa-sm fa-chevron-right fa-fw' /></span>
  );
}

const allowDrop = (props) => {
  const { dropNode, dragNode, dropPosition, enableCopy } = props

  if (dropPosition === -1) return false;

  if (enableCopy) {
    return true
  }

  if (!dropNode.children && !dragNode.children && (dropNode.path.replace(dropNode.name, '') === dragNode.path.replace(dragNode.name, ''))) {
    return false;
  }

  return true;
}

const motion = {
  motionName: 'node-motion',
  motionAppear: false,
  onAppearStart: () => ({ height: 0 }),
  onAppearActive: node => ({ height: node.scrollHeight }),
  onLeaveStart: node => ({ height: node.offsetHeight }),
  onLeaveActive: () => ({ height: 0 }),
};

const setLeaf = (treeData, curKey) => {
  const loopLeaf = (data) => {
    data.forEach(item => {
      if (!item.key) {
        item.key = item.path;
      }
      if (!item.title) {
        item.title = item.name;
      }

      if (
        item.path.length > curKey.length
          ? item.path.indexOf(curKey) !== 0
          : curKey.indexOf(item.path) !== 0
      ) {
        return;
      }
      if (item.children) {
        loopLeaf(item.children);
      } else if (!item.children || item.children.length === 0) {
        item.isLeaf = true;
      }
    });
  };
  loopLeaf(treeData);
}

const getNewTreeData = (treeData, curKey, child) => {
  const loop = data => {
    data.forEach(item => {
      if (curKey.indexOf(item.path) === 0) {
        if (item.children?.length > 0) {
          loop(item.children);
        } else {
          item.children = child;
        }
      }
    });
  };
  loop(treeData);
  setLeaf(treeData, curKey);
}

const replaceTreeNode = (treeData, curKey, child) => {
  const loop = data => {
    data.forEach(item => {
      if (curKey === item.path) {
        item.children = child
      } else if (item.children) {
        loop(item.children)
      }
    });
  };
  loop(treeData);
}


const FileTree = ({ projectManager, onSelect }, ref) => {
  const treeRef = React.useRef()
  const [treeData, setTreeData] = useState([])
  const [autoExpandParent, setAutoExpandParent] = useState(true)
  const [expandedKeys, setExpandKeys] = useState([])
  const [selectedKeys, setSelectedKeys] = useState([])
  const [enableCopy, setEnableCopy] = useState(false)
  const prevTreeData = useRef()

  React.useImperativeHandle(ref, () => ({
    setActive(key) {
      if (!selectedKeys.includes(key)) {
        setSelectedKeys([key])
      }
    },
    setNoActive() {
      setSelectedKeys([])
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
    setExpandKeys([treeData.path])
  }

  const refreshDirectory = async (directory) => {
    const tempTree = cloneDeep(prevTreeData.current)

    if(!directory) {
      return
    }

    replaceTreeNode(tempTree, directory.path, directory.children);
    setLeaf(tempTree, tempTree[0].path)
    setTreeData(tempTree);
  }

  const handleLoadData = treeNode => {
    return new Promise(resolve => {
      if (!treeNode.children) {
        resolve()
      } else {
        const tempTreeData = cloneDeep(treeData);
        projectManager.loadDirectory(treeNode).then(newData => {
          setTimeout(() => {
            getNewTreeData(tempTreeData, treeNode.path, newData);
            setTreeData(tempTreeData);
            resolve();
          }, 500);
        })
      }
    });
  };

  const handleSelect = (_, { node }) => {
    if (node.isLeaf) {
      onSelect(node)
    }
  }

  const handleExpand = (keys) => {
    setAutoExpandParent(false)
    setExpandKeys(keys)
  }

  const expandFolderNode = (event, node) => {
    const { isLeaf } = node;

    if (isLeaf) {
      return;
    }

    if (treeRef.current) {
      treeRef.current.onNodeExpand(event, node);
    }

  };

  const onDebounceExpand = debounce(expandFolderNode, 200, {
    leading: true,
  });

  const handleClick = useCallback((event, node) => {
    onDebounceExpand(event, node);
  }, [expandedKeys])

  const handleDrop = ({ node, dragNode }) => {
    fileOps(dragNode.path, node.path)
  };

  const handleDragOver = ({ event }) => {
    setEnableCopy(event.altKey)
  }
  const handleDragStart = ({ event }) => {
    setEnableCopy(event.altKey)
  }
  const onDebounceDrag = debounce(handleDrop, 2000, {
    leading: true,
  })

  useEffect(() => {
    prevTreeData.current = treeData
  })

  useEffect(() => {
    loadTree(projectManager)
  }, [])

  return (
    <div className="tree-wrap animation">
      <Tree
        draggable
        allowDrop={(props) => allowDrop({ ...props, enableCopy })}
        onDrop={onDebounceDrag}
        ref={treeRef}
        motion={motion}
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
        onClick={handleClick}
        onExpand={handleExpand}
        onSelect={handleSelect}
        onLoad={handleLoadData}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
      />
    </div>
  );
}
const ForwardFileTree = React.forwardRef(FileTree);
ForwardFileTree.displayName = 'FileTree';

export default ForwardFileTree;

export { default as ClipBoardService } from "./clipboard"
