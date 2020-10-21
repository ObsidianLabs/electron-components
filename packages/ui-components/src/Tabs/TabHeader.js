import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'

class TabHeaderItem extends PureComponent {
  static propTypes = {
    size: PropTypes.string,
    tab: PropTypes.object.isRequired,
    tabText: PropTypes.node.isRequired,
    active: PropTypes.bool.isRequired,
    onSelectTab: PropTypes.func.isRequired,
    onCloseTab: PropTypes.func,
  }

  renderCloseBtn () {
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

  render () {
    const { size, tab, tabText, active, onSelectTab, onCloseTab } = this.props

    return (
      <li className={classnames('nav-item', { active })}>
        <div
          className={classnames('btn d-flex flex-row align-items-center border-0 w-100', size && `btn-${size}`)}
          onMouseDown={e => e.button === 0 && onSelectTab(tab)}
          onMouseUp={e => e.button === 1 && onCloseTab && onCloseTab(tab)}
        >
          <div className='nav-item-content d-flex flex-row'>
            <div className='nav-item-text'><span>{tabText}</span></div>
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
  }

  render () {
    const { className, size, tabs, selected, getTabText, onSelectTab, onCloseTab } = this.props

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
      </ul>
    )
  }
}
