import cloneDeep from 'lodash/cloneDeep'
import { useCallback } from 'react'

let timer
let task = []
let waitingTime = 200

const useBatchLoad = ({ treeData, projectManager, getNewTreeData, setTreeData }) => {
  const handler = (treeNode) => {
    return new Promise(async (resolve, reject) => {
      let folderData
      try {
        folderData = await projectManager.loadDirectory(treeNode)
      } catch (e) {
        reject(e)
      }
      task.push({ pathKey: treeNode.path, pathValue: folderData })
      clearTimeout(timer)
      timer = setTimeout(() => {
        let tempTreeData = cloneDeep(treeData)
        task.forEach(item => {
          Object.keys(item).length === 0 && resolve()
          getNewTreeData(tempTreeData, item.pathKey, item.pathValue)
        })
        setTreeData(tempTreeData)
        waitingTime = 200
        task = []
      }, waitingTime)
      setTimeout(resolve, waitingTime)
    })
  }

  return useCallback(async (treeNode) => {
    waitingTime += 500
    await handler(treeNode)
  }, [treeData])
}

export default useBatchLoad
