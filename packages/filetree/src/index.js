import React, { useCallback, useEffect, useState } from 'react'
import fileOps from '@obsidians/file-ops'
import Tree from 'rc-tree'
import cloneDeep from 'lodash/cloneDeep'
import debounce from 'lodash/debounce'

import './styles.css'

const renderIcon = (props) => {
  const { expanded, loading, isLeaf } = props;
  if (isLeaf) {
    return <i className='fas fa-file-code fa-fw mr-1' />
  }
  return expanded && !loading ? <span key='open' ><span className='fas fa-folder-open fa-fw  mr-1' /></span> : <span key='close'><span className='fas fa-folder fa-fw  mr-1' /></span>
};

const renderSwitcherIcon = ({ loading, expanded, isLeaf }) => {
  if (loading && !isLeaf) {
    return <span key='loading'><span className='fas fa-sm fa-spin fa-spinner  fa-fw' /></span>
  }

  if (isLeaf) {
    return null;
  }

  return expanded ? (
    <span key='switch-expanded'><span className='far fa-sm fa-chevron-down fa-fw' /></span>
  ) : (
    <span key='switch-close'><span className='far fa-sm fa-chevron-right fa-fw' /></span>
  );
}

const allowDrop = (props) => {
  const { dropNode, dragNode, dropPosition } = props
  if (dropNode.path.replace(dropNode.name) === dragNode.path.replace(dragNode.name)) {
    return false;
  }

  if (!dropNode.children) {
    if (dropPosition === 0) return false;
  }

  return true;
  // TODO: move copy logic
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

const FileTree = ({ projectManager, onSelect }, ref) => {
  const treeRef = React.useRef()
  const [treeData, setTreeData] = useState([])
  const [autoExpandParent, setAutoExpandParent] = useState(true)
  const [expandedKeys, setExpandKeys] = useState([])
  const [selectedKeys, setSelectedKeys] = useState([])
  const [rerender, setRerender] = useState(false);

  React.useImperativeHandle(ref, () => ({
    setActive(key) {
      if (!selectedKeys.includes(key)) {
        setSelectedKeys([key])
      }
    },
    setNoActive() {
      setSelectedKeys([])
    }
  }));

  const loadTree = async projectManager => {
    projectManager.onRefreshDirectory(refreshDirectory)
    const treeData = await projectManager.loadRootDirectory()
    setLeaf([treeData], treeData.path)

    setTreeData([treeData])
    setExpandKeys([treeData.path])
  }

  const refreshDirectory = async (directory) => {
    console.log('refreshDirectory', directory)
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
            setRerender(!rerender);
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

  const handleDrop = info => {
    const dropKey = info.node.path;
    const dragKey = info.dragNode.path;
    const dropPos = info.node.pos.split('-');
    const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);

    const loop = (data, key, callback) => {
      data.forEach((item, index, arr) => {
        if (item.path === key) {
          callback(item, index, arr);
          return;
        }
        if (item.children) {
          loop(item.children, key, callback);
        }
      });
    };
    const data = [...treeData];

    // Find dragObject
    let dragObj;
    loop(data, dragKey, (item, index, arr) => {
      arr.splice(index, 1);
      dragObj = item;
    });

    if (dropPosition === 0) {
      // Drop on the content
      loop(data, dropKey, item => {
        // eslint-disable-next-line no-param-reassign
        item.children = item.children || [];
        // where to insert
        item.children.unshift(dragObj);
      });
    } else {
      // Drop on the gap (insert before or insert after)
      let ar;
      let i;
      loop(data, dropKey, (_, index, arr) => {
        ar = arr;
        i = index;
      });
      if (dropPosition === -1) {
        ar.splice(i, 0, dragObj);
      } else {
        ar.splice(i + 1, 0, dragObj);
      }
    }

    setTreeData(data)
  };

  const onDebounceDrag = debounce(handleDrop, 2000, {
    leading: true,
  })
  useEffect(() => {
    loadTree(projectManager)
  }, [])

  return (
    <div className="tree-wrap animation">
      <Tree
        draggable
        allowDrop={allowDrop}
        onDrop={onDebounceDrag}
        ref={treeRef}
        motion={motion}
        itemHeight={20}
        icon={renderIcon}
        treeData={treeData}
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
      />
    </div>
  );
}
const ForwardFileTree = React.forwardRef(FileTree);
ForwardFileTree.displayName = 'FileTree';

export default ForwardFileTree;

export { default as ClipBoardService } from "./clipboard"
