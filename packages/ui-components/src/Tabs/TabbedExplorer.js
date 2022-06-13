import React, { PureComponent } from 'react'

import CacheRoute from 'react-router-cache-route'
import TabsWithNavigationBar from './TabsWithNavigationBar'
import LoadingScreen from '../Screen/LoadingScreen'
import Screen from '../Screen/Screen'
import { Button } from 'reactstrap'
import platform from '@obsidians/platform'
import { t } from '@obsidians/i18n'

export default class TabbedExplorer extends PureComponent {
  constructor (props) {
    super(props)

    this.tabs = React.createRef()
    this.page = React.createRef()
    this.state = {
      initialized: false,
    }
  }

  initialize = (initial) => {
    let selectedTabKey = ''
    const initialTabs = initial.tabs.map((value, index) => {
      const key = `tab-${index}`
      if (value === initial.value) {
        selectedTabKey = key
      }
      return { key, value }
    })
    let initialSelected
    if (!selectedTabKey) {
      initialSelected = { key: `tab-${initialTabs.length}`, value: initial.value }
      initialTabs.push(initialSelected)
    } else {
      initialSelected = { key: selectedTabKey, value: initial.value }
    }

    this.setState({
      initialized: initial.subroute,
      initialSelected,
      initialTabs,
      value: initial.value,
    })
  }

  get currentValue () {
    return this.state.value
  }

  openTab = value => {
    if (this.props.valueFormatter) {
      value = this.props.valueFormatter(value)
    }
    if (value === this.currentValue) {
      return
    }
    this.tabs.current?.openTab(value)
  }

  onValue = value => {
    if (this.props.valueFormatter) {
      const formatted = this.props.valueFormatter(value)
      if (formatted !== value) {
        value = formatted
      }
    }
    this.tabs.current?.updateTab({ value, text: '' })
    this.setState({ value })
    return value
  }

  onPageDisplay = page => {
    this.currentPage = page
  }

  onRefresh = () => this.currentPage?.refresh()

  render (props) {
    const {
      route,
      subroute = '',
      tabs,
      onValueUpdate,
      onTabsUpdate,
      getTabText = tab => tab?.value,
      starred,
      onStarredUpdate,
      ToolbarButtons = () => null,
      ExtraToolbarButtons = () => null,
      Page,
      cacheLifecycles,
      tabContextMenu,
      history,
      ...otherProps
    } = { ...props, ...this.props }
    const { initialized, initialTabs, initialSelected, value } = this.state

    if (!initialized || initialized !== subroute) {
      return (
        <>
          <Screen>
            <h4 className='display-4'>{t('network.network.noNetwork')}</h4>
            <p className='lead'>{platform.isWeb ? t('network.network.webNoNetworkText') :  t('network.network.noNetworkText')}</p>
            <hr />
            <span>
              <Button icon='' color='primary' onClick={() => history.push(`/network`)}>{t('network.network.gotoNetwork')}</Button>
            </span>
          </Screen>
        </>
      )
    }

    return <>
      <TabsWithNavigationBar
        ref={this.tabs}
        initialTabs={initialTabs}
        initialSelected={initialSelected}
        getTabText={getTabText}
        maxTabWidth={46}
        tabContextMenu={tabContextMenu}
        onValue={value => {
          const formatted = this.onValue(value)
          onValueUpdate && onValueUpdate(formatted)
        }}
        onChangeTab={value => {
          this.setState({ value })
          onValueUpdate && onValueUpdate(value)
        }}
        onTabsUpdated={onTabsUpdate}
        starred={starred}
        onChangeStarred={onStarredUpdate}
        onRefresh={this.onRefresh}
        NavbarButtons={<>
          <ToolbarButtons explorer={this} value={value} {...otherProps} />
          <ExtraToolbarButtons explorer={this} value={value} {...otherProps} />
        </>}
      >
        <CacheRoute
          path={`/${route}/:value?`}
          cacheKey={props => `${route}-${subroute}-${props.match?.params?.value}`}
          multiple={5}
          className='h-100 overflow-auto'
          render={props => (
            <Page
              cacheLifecycles={props.cacheLifecycles}
              onDisplay={this.onPageDisplay}
              value={props.match?.params?.value}
              tabs={this.tabs.current}
              onRefresh={this.onRefresh}
              {...otherProps}
            />
          )}
        />
      </TabsWithNavigationBar>
    </>
  }
}
