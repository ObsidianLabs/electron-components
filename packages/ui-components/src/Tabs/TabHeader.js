import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import { findDOMNode } from 'react-dom'
import { UncontrolledTooltip } from 'reactstrap'
import { DragSource, DropTarget, DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import platform from '@obsidians/platform'
import { Menu, Item, useContextMenu, Separator } from 'react-contexify'

const Types = {
  TAB: 'tab'
}

const cardSource = {
  beginDrag(props) {
    return {
      id: props.tab.key,
      index: props.index,
    }
  }
}

const cardTarget = {
  hover(props, monitor, component) {
    const dragIndex = monitor.getItem().index
    const hoverIndex = props.index

    if (dragIndex === hoverIndex) {
      return
    }

    const hoverBoundingRect = findDOMNode(component).getBoundingClientRect()

    const hoverMiddleX = (hoverBoundingRect.right - hoverBoundingRect.left) / 2

    const clientOffset = monitor.getClientOffset()

    const hoverClientX = clientOffset.x - hoverBoundingRect.left

    if (dragIndex < hoverIndex && hoverClientX < hoverMiddleX) {
      return
    }

    if (dragIndex > hoverIndex && hoverClientX > hoverMiddleX) {
      return
    }

    props.onDrag(dragIndex, hoverIndex);

    monitor.getItem().index = hoverIndex;
  },
};

function targetCollect(connect) {
  return {
    connectDropTarget: connect.dropTarget()
  }
}

const sourceCollect = (connect, monitor) => {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  }
}

class TabHeaderItem extends PureComponent {
  static propTypes = {
    connectDragSource: PropTypes.func.isRequired,
    connectDropTarget: PropTypes.func.isRequired,
    index: PropTypes.number.isRequired,
    isDragging: PropTypes.bool.isRequired,
    size: PropTypes.string,
    tab: PropTypes.object.isRequired,
    tabText: PropTypes.node.isRequired,
    active: PropTypes.bool.isRequired,
    onSelectTab: PropTypes.func.isRequired,
    onCloseTab: PropTypes.func,
    onDrag: PropTypes.func,
    contextMenu: PropTypes.array,
  }

  renderCloseBtn() {
    const { tab, unsaved, saving, onCloseTab } = this.props
    if (!onCloseTab) {
      return null
    }

    return (
      <div
        className='nav-item-close d-flex align-items-center justify-content-center'
        onMouseDown={e => e.button !== 1 && e.stopPropagation()}
        onClick={e => {
          e.stopPropagation()
          onCloseTab(tab)
        }}
      >
        <span
          key='nav-item-dot'
          className={classnames('nav-item-close-dot', { active: unsaved && !saving })}
        >
          <i className='fas fa-circle' />
        </span>
        <span
          key='nav-item-loading'
          className={classnames('nav-item-close-loading', { active: saving })}
        >
          <i className='fas fa-spin fa-spinner' />
        </span>
        <span
          key='nav-item-close'
          className={classnames('nav-item-close-times', { active: !unsaved && !saving })}
        >
          <i className='fas fa-times' />
        </span>
      </div>
    )
  }

  render() {
    const { size, tab, active, tabText, isDragging, onSelectTab, onCloseTab, onContextMenu, connectDragSource, connectDropTarget } = this.props
    const opacity = isDragging ? 0 : 1

    return connectDragSource(
      connectDropTarget(

        <li className={classnames('nav-item', { active })} style={{ opacity }} onContextMenu={(event) => onContextMenu(event, tab)}>
          <div
            className={classnames('btn d-flex flex-row align-items-center border-0 w-100', size && `btn-${size}`)}
          >
            <div className='nav-item-content d-flex flex-row'>

              <div className='nav-item-text' onMouseDown={e => {
                e.stopPropagation()
                e.button === 0 && onSelectTab(tab)

              }}
                onMouseUp={e => {
                  e.stopPropagation()
                  e.button === 1 && onCloseTab && onCloseTab(tab)
                }}>
                <div key={tab.key} className='d-flex flex-row align-items-center'>
                  {tabText}
                </div>
              </div>
            </div>
            {this.renderCloseBtn()}
          </div>
        </li>

      ))
  }
}

const SortableTab = DragSource(Types.TAB, cardSource, sourceCollect)(DropTarget(Types.TAB, cardTarget, targetCollect)(TabHeaderItem))

const TabHeader = ({ className, size, tabs, selected, getTabText, onSelectTab, ToolButtons = [], onCloseTab, onNewTab, contextMenu, onDragTab }) => {
  const treeNodeContextMenu = typeof contextMenu === 'function' ? contextMenu(selected) : contextMenu
  const { show } = useContextMenu({
    id: 'tab-context-menu'
  })

  const handleContextMenu = (event, tab) => {
    event.nativeEvent.preventDefault()
    // handleSetSelectNode(node)
    show(event.nativeEvent, {
      props: {
        key: 'value'
      }
    })
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className='nav-tab-wrap'>
        <ul className={classnames('nav nav-tabs', className)}>
          {
            tabs.map((tab, index) => {
              const tabText = getTabText ? getTabText(tab) : tab.text
              return (
                <SortableTab
                  key={tab.key}
                  size={size}
                  tab={tab}
                  index={index}
                  unsaved={tab.unsaved}
                  saving={tab.saving}
                  tabText={tabText}
                  active={selected.key === tab.key}
                  onSelectTab={onSelectTab}
                  onCloseTab={onCloseTab}
                  onDrag={onDragTab}
                  onContextMenu={handleContextMenu}
                />
              )
            })
          }
          <div className='flex-grow-1' />
          {
            ToolButtons.map((btn, index) => {
              const id = `tab-btn-${index}`
              return <li key={id}>
                <div id={id} className={classnames('btn btn-transparent rounded-0', size && `btn-${size}`)} onClick={btn.onClick}>
                  <i className={btn.icon} />
                  <span>{btn.text}</span>
                </div>
                <UncontrolledTooltip delay={0} target={id} placement='bottom' >
                  {btn.tooltip}
                </UncontrolledTooltip>
              </li>
            })
          }
        </ul>
        <div className='nav-actions'>
          {onNewTab && platform.isDesktop &&
            <span
              key='nav-item-add'
              className={classnames('btn border-0', size && `btn-${size}`)}
              onMouseDown={e => e.button === 0 && onNewTab()}
            >
              <i className='fas fa-plus' />
            </span>
          }
        </div>
        <Menu animation={false} id='tab-context-menu'>
          {
            treeNodeContextMenu?.map(item => item ? <Item onClick={() => item.onClick(selected)}>{item.text}</Item> : <Separator />)
          }
        </Menu>
      </div>
    </DndProvider>
  )
}

export default TabHeader
