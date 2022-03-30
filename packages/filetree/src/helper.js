const computeType = (valueArr) => {
  const errorCount = valueArr.filter(item => item.type === 'error').length
  const warningCount = valueArr.filter(item => item.type === 'warning').length

  return {
    type: errorCount ? 'error' : warningCount ? 'warning' : 'default',
    count: errorCount || warningCount || -1
  }
}

const updateEachNode = (typeInfo, pathInfo, treeMap) => {
  const updateBranch = (cur, nodeValue) => {
    if (!nodeValue) {
      treeMap[cur] = {
        name: cur,
        type: typeInfo.type,
        isLeaf: false
      }
    } else {
      const oldDefault = nodeValue.type === 'default'
      const oldError = nodeValue.type === 'error'
      const oldWarning = !oldDefault && !oldError
      const newError = typeInfo.type === 'error'
      if (oldError) {
        return
      }
      if (oldWarning) {
        nodeValue.type = newError ? 'error' : 'warning'
        return
      }
      if (oldDefault) {
        nodeValue.type = typeInfo.type
      }
    }
  }

  const updateLeaf = (curPath, nodeValue) => {
    if (!nodeValue) {
      treeMap[curPath] = {
        name: curPath,
        type: typeInfo.type,
        isLeaf: true,
        count: typeInfo.count
      }
    } else {
      const oldDefault = nodeValue.type === 'default'
      const oldError = nodeValue.type === 'error'
      const oldWarning = !oldDefault && !oldError
      const newError = typeInfo.type === 'error'
      if (oldError) {
        return
      }
      if (oldWarning) {
        nodeValue.type = newError ? 'error' : 'warning'
        nodeValue.count = newError ? typeInfo.count : nodeValue.count
        return
      }
      if (oldDefault) {
        nodeValue.type = typeInfo.type
        nodeValue.count = typeInfo.count
      }
    }
  }

  pathInfo.forEach((cur, index) => {
    const isLeaf = index === pathInfo.length - 1
    const nodeValue = treeMap[cur]
    isLeaf ? updateLeaf(cur, nodeValue) : updateBranch(cur, nodeValue)
  })
}

const updateErrorInfo = (decorations, fileKey) => {
  const keyArr = Object.keys(decorations)

  return keyArr.reduce((prev, cur) => {
    const typeInfo = computeType(decorations[cur])
    const pathInfo = cur.replace(fileKey + '/', '').split('/')

    updateEachNode(typeInfo, pathInfo, prev)
    return prev
  }, {})
}

const travelTree = (treeData, fn, extraValue) => {
  const travel = (tree, fn) => {
    fn(tree, extraValue)

    if (!tree.children) return
    for (let i = 0; i < tree.children.length; i++) {
      travel(tree.children[i], fn)
    }
  }
  travel(treeData, fn)
}

export {
  updateErrorInfo,
  travelTree
}
