import React, { useEffect, useState } from 'react'
import fileOps from '@obsidians/file-ops'
import Tree from 'rc-tree'
import cloneDeep from 'lodash/cloneDeep'
import debounce from 'lodash/debounce'

import './styles.css'

const renderIcon = (props) => {
  const { data, expanded, loading, isLeaf } = props;
  if (data.type === 'file') {
    return <i className='fas fa-file-code fa-fw mr-1' />
  }
  if (data.type === 'folder') {
    return expanded && !loading ? <span key='open' ><span className='fas fa-folder-open fa-fw  mr-1' /></span> : <span key='close'><span className='fas fa-folder fa-fw  mr-1' /></span>
  }
};

const renderSwitcherIcon = ({ loading, expanded, data }) => {
  if (loading && data.type === 'folder') {
    return <span key='loading'><span className='fas fa-sm fa-spin fa-spinner  fa-fw' /></span>
  }

  if (data.type === 'file') {
    return null;
  }

  return expanded ? (
    <span key='switch-expanded'><span className='far fa-sm fa-chevron-down fa-fw' /></span>
  ) : (
    <span key='switch-close'><span className='far fa-sm fa-chevron-right fa-fw' /></span>
  );
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
      if (
        item.key.length > curKey.length
          ? item.key.indexOf(curKey) !== 0
          : curKey.indexOf(item.key) !== 0
      ) {
        return;
      }
      if (item.children) {
        loopLeaf(item.children);
      } else if( !item.children || item.children.length === 0 ) {
        item.isLeaf = true;
      }
    });
  };
  loopLeaf(treeData);
}

const getNewTreeData = (treeData, curKey, child) => {
  const loop = data => {
    data.forEach(item => {
      if (curKey.indexOf(item.key) === 0) {
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

  React.useImperativeHandle(ref, () => ({
    setActive(key) {
      if(!selectedKeys.includes(key)) {
        setSelectedKeys([key])
      }
    },
    setNoActive() {
      setSelectedKeys([])
    }
  }));

  const loadTree = async projectManager => {
    const treeData = await projectManager.loadRootDirectory()
    setTreeData([treeData])
    setExpandKeys([treeData.key])
  }

  const handleLoadData = treeNode => {
    if (!treeNode.key) return;

    return new Promise(resolve => {
      const tempTreeData = cloneDeep(treeData);
      projectManager.loadDirectory(treeNode).then(newData => {
        setTimeout(() => {
          getNewTreeData([...tempTreeData], treeNode.key, newData);
          setTreeData(tempTreeData);
          resolve();
        }, 500);
      })
    });
  };

  const handleSelect = (_, {node}) => {
    if(node.type === 'file') {
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

    treeRef.current.onNodeExpand(event, node);
  };

  const onDebounceExpand = debounce(expandFolderNode, 200, {
    leading: true,
  });

  const handleClick = (event, node) => {
    onDebounceExpand(event, node);
  }

  useEffect(() => {
    loadTree(projectManager)
  }, [])

  return (
    <div className="tree-wrap animation">
      <Tree
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
