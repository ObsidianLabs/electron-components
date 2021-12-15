import React, { useEffect, useState } from 'react'
import fileOps from '@obsidians/file-ops'
import Tree from 'rc-tree'
import cloneDeep from 'lodash/cloneDeep'

import './styles.css'

function renderIcon(props) {
  const { data, expanded, loading } = props;
  if (data.type === 'file') {
    return <i className='fas fa-file-code fa-fw mr-1' />
  }
  if (data.type === 'folder') {
    return expanded && !loading ? <span key='open' ><span className='fas fa-folder-open fa-fw  mr-1' /></span> : <span key='close'><span className='fas fa-folder fa-fw  mr-1' /></span>
  }
};

function renderSwitcherIcon({ loading, expanded, data }) {
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

function setLeaf(treeData, curKey, level) {
  const loopLeaf = (data, lev) => {
    const l = lev - 1;
    data.forEach(item => {
      if (
        item.key.length > curKey.length
          ? item.key.indexOf(curKey) !== 0
          : curKey.indexOf(item.key) !== 0
      ) {
        return;
      }
      if (item.children) {
        loopLeaf(item.children, l);
      } else if (l < 1) {
        // eslint-disable-next-line no-param-reassign
        item.isLeaf = true;
      }
    });
  };
  loopLeaf(treeData, level + 1);
}

function getNewTreeData(treeData, curKey, child) {
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


const FileTree = ({ projectManager }) => {
  const treeRef = React.useRef()
  const [treeData, setTreeData] = useState([])
  const [autoExpandParent, setAutoExpandParent] = useState(true)
  const [expandedKeys, setExpandKeys] = useState([])

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

  const treeCls = `myCls${('customIcon') || ''}`;

  const handleExpand = (keys) => {
    setAutoExpandParent(false)
    setExpandKeys(keys)
  }

  useEffect(() => {
    loadTree(projectManager)
  }, [])

  return (
    <div className="tree-wrap animation">
      <Tree
        className={treeCls}
        ref={treeRef}
        // onSelect={handleSelect}
        loadData={handleLoadData}
        expandedKeys={expandedKeys}
        autoExpandParent={autoExpandParent}
        onExpand={handleExpand}
        icon={renderIcon}
        switcherIcon={(nodeProps) =>
          renderSwitcherIcon(nodeProps)
        }
        motion={motion}
        itemHeight={20}
        onLoad={handleLoadData}
        treeData={treeData}
      />
    </div>
  );
}
const ForwardFileTree = React.forwardRef(FileTree);
ForwardFileTree.displayName = 'FileTree';

export default ForwardFileTree;

export { default as ClipBoardService } from "./clipboard"
