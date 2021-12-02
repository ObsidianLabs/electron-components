import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import { ContextMenuTrigger } from 'react-contextmenu'
import TabContextMenu from './TabContextMenu'
import { UncontrolledTooltip } from 'reactstrap'

class TabHeaderItem extends PureComponent {
  static propTypes = {
    size: PropTypes.string,
    tab: PropTypes.object.isRequired,
    tabText: PropTypes.node.isRequired,
    active: PropTypes.bool.isRequired,
    onSelectTab: PropTypes.func.isRequired,
    onCloseTab: PropTypes.func,
    contextMenu: PropTypes.array,
  }

  renderCloseBtn() {
    const { tab, unsaved, saving, onCloseTab, contextMenu } = this.props
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
    const { size, tab, tabText, active, onSelectTab, onCloseTab, contextMenu } = this.props

    return (
      <li className={classnames('nav-item', { active })}>

        <div
          className={classnames('btn d-flex flex-row align-items-center border-0 w-100', size && `btn-${size}`)}
        >
          <div className='nav-item-content d-flex flex-row'>
            <ContextMenuTrigger
              id={`${tab.key}/tab-item`}
              ref={ref => { this.clickableRef = ref }}
              attributes={{
                onClick: e => e.preventDefault()
              }}
            >
              <div className='nav-item-text' onMouseDown={e => {
                e.button === 0 && onSelectTab(tab)

              }}
                onMouseUp={e => {
                  e.button === 1 && onCloseTab && onCloseTab(tab)
                }}>
                <div key={tab.key} className='d-flex flex-row align-items-center'>
                  {tabText}
                </div>
              </div>
              <TabContextMenu
                node={tab}
                contextMenu={contextMenu}
              />
            </ContextMenuTrigger>

          </div>
          {this.renderCloseBtn()}

        </div>

      </li>
    )
  }
}


export default class TabHeader extends PureComponent {
  static propTypes = {
    className: PropTypes.string,
    size: PropTypes.string,
    tabs: PropTypes.arrayOf(PropTypes.object).isRequired,
    selected: PropTypes.object.isRequired,
    getTabText: PropTypes.func,
    onSelectTab: PropTypes.func.isRequired,
    onCloseTab: PropTypes.func,
    onNewTab: PropTypes.func,
    contextMenu: PropTypes.array,
  }

  render() {
    const { className, size, tabs, selected, getTabText, onSelectTab, onCloseTab, ToolButtons = [], contextMenu } = this.props

    return (
      <ul className={classnames('nav nav-tabs', className)}>
        {
          tabs.map(tab => {
            const tabText = getTabText ? getTabText(tab) : tab.text
            return (
              <TabHeaderItem
                key={tab.key}
                size={size}
                tab={tab}
                unsaved={tab.unsaved}
                saving={tab.saving}
                tabText={tabText}
                active={selected.key === tab.key}
                onSelectTab={onSelectTab}
                onCloseTab={onCloseTab}
                contextMenu={contextMenu}
              />
            )
          })
        }
        {
          this.props.onNewTab &&
          <li className='nav-item nav-item-add'>
            <div
              key='nav-item-add'
              className={classnames('btn border-0', size && `btn-${size}`)}
              onMouseDown={e => e.button === 0 && this.props.onNewTab()}
            >
              <i className='fas fa-plus' />
            </div>
          </li>
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
    )
  }
}
