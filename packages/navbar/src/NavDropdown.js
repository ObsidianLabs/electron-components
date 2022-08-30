import React, { Component, PureComponent } from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import { Menu, Item, useContextMenu, Separator } from 'react-contexify'
import { v4 as uuidv4 } from 'uuid'

import {
  ButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  UncontrolledTooltip,
  Button,
} from '@obsidians/ui-components'
import { t } from '@obsidians/i18n'

export default class NavDropdown extends Component {
  static propTypes = {
    selected: PropTypes.string.isRequired,
    list: PropTypes.array.isRequired,
    onClickItem: PropTypes.func.isRequired,
    icon: PropTypes.string,
    logoIcon: PropTypes.string
  }

  state = {
    dropdown: false,
    activeItem: null,
    testnetDropdown: false
  }

  contextMenuHandler = useContextMenu({
    id: `nav-contextmenu-${this.props.route}`
  })

  handleContextMenu = (event) => {
    event.nativeEvent.preventDefault()

    this.contextMenuHandler.show(event.nativeEvent, {
      props: {
        key: 'value'
      }
    })
  }

  onToggle = event => {
    if (this.props.onToggle) {
      if (this.props.onToggle(event)) {
        return
      }
    }

    if(this.props.disable) {
      return
    }
    
    this.setState({ dropdown: !this.state.dropdown })
  }

  onClickItem = (event, item, isNetworkModule = true) => {
    event.preventDefault()
    isNetworkModule && this.setState({ dropdown: !this.state.dropdown })
    this.props.onClickItem(item)
  }

  customNetworkBtnsBody = (list = []) => {
    const customSelectedId = list.find(elem => elem.id === this.props.selected)?.id
    return (
      <div className='d-flex mt-1 w-100' style={{flexWrap: 'wrap'}}>
        {
          list.map(item => {
            const nameToId = uuidv4()
            return (<div className='w-25 mt-2 pr-2' key={`custom-network-item-${nameToId}`}>
              <Button className={classnames({ active: customSelectedId === item.id }, 'text-overflow-dots w-100')}
                id={`custom-nav-${nameToId}`} size='sm' onClick={e => this.onClickItem(e, item)}
                >{item.name}</Button>
              <UncontrolledTooltip placement='bottom' target={`custom-nav-${nameToId}`}>
                {item.name}
              </UncontrolledTooltip>
            </div>
          )})
        }
      </div>
    )
  }

  networkItemNameBody = (isSelected, logoIcon, group, iconClassName) => {
    return (
      <>
        <span key={`dropdown-item-${isSelected}`}>
          {
            (process.env.REACT_APP_PROJECT_SHARE_URL && logoIcon)
            ?
            <img src={logoIcon} className='mr-2 network-icon'/>
            :
            <i className={classnames('mr-2 fas fa-vial', iconClassName)}/>
          }
        </span>
        {group}
      </>
    )
  }

  networkItemBtnsBody = (isSelected, iconClassName, id, list = [], item, isCustomNetwork) => {
    const testnetLen = list.length
    const isTestnetSelected = !isSelected && testnetLen > 1 && list.find(elem => elem.id === this.props.selected)
    const styleRelativeRight = id === 'dev' ? '3.35rem' : (!testnetLen && '5.5rem')
    let networkBtns = <Button size='sm' style={{marginRight: '1rem'}} 
      onClick={e => this.onClickItem(e, list[0])}
      className={classnames({ active: (list[0]?.id === this.props.selected) })}
      >Testnet</Button>

    if (testnetLen > 1 && item.group !== 'others') {
      networkBtns = (
        <div className='d-flex' size='sm'>
          <ButtonDropdown
            className='d-flex flex-1 w-100'
            isOpen={this.state.testnetDropdown}
            toggle={e => {
                e.preventDefault()
                this.setState({testnetDropdown: !this.state.testnetDropdown})
              }
            }
          >
            <DropdownToggle
              tag='div'
              caret
              className='p-0 nav-dropdown-toggle-testnet'
              onClick={event => event.preventDefault()}
            >
              <div className='d-flex nav-dropdown-testnet-list'>
                <Button size='sm' className={classnames({ active: isTestnetSelected })}>
                  {isTestnetSelected?.name || list[0]?.name}
                </Button>
                <div className={classnames('icon cursor-pointer')}>
                  <i className='fas-icon fas fa-solid fa-sort-down'/>
                </div>
              </div>
            </DropdownToggle>

            <DropdownMenu className='testnet-dropdowm-menu'>
              {
                list.map(item => (
                  <DropdownItem
                  className={classnames({ active: (isTestnetSelected?.name === item.name) })}
                  key={`test-network-item-${uuidv4()}`}
                  onClick={e => this.onClickItem(e, item)}
                  >{item.name}</DropdownItem>
                ))
              }
            </DropdownMenu>
          </ButtonDropdown>
        </div>
      )
    }
    return <div>
    {
      isCustomNetwork ?
      <Button size='sm' onClick={e => this.onClickItem(e, item)}>
        <i className={classnames('mr-1', iconClassName)}/>Custom
      </Button>
      :
      <div className='d-flex flex-1 w-100'>
        <Button size='sm' className={classnames('p-relative', !testnetLen ? 'ml-2' : 'mx-2', { active: isSelected })}
          style={{right: styleRelativeRight}}
          onClick={e => this.onClickItem(e, item)}
          >{item.name}</Button>
        {!!testnetLen && networkBtns}
      </div>
    }
    </div>
  }

  renderDropdownList = list => {
    if (!list.length) {
      return <DropdownItem disabled>({t('header.title.none')})</DropdownItem>
    }
    return list.map(this.renderDropdownItem)
  }

  renderDropdownItem = (item, index, listDropMenu) => {
    const nameToId = uuidv4()
    const isNetworkModule = this.props.route === 'network'
    if (item.divider) {
      return <DropdownItem className={classnames(isNetworkModule && 'cursor-default')} divider key={`dropdown-item-divider-${nameToId}`} />
    } else if (item.header) {
      return <DropdownItem className='cursor-default' header key={`dropdown-item-header-${nameToId}`}>{item.header}</DropdownItem>
    } else if (item.none) {
      return <DropdownItem disabled key={`dropdown-item-none-${nameToId}`}>({t('header.title.none')})</DropdownItem>
    }

    const { id, name, icon, logoIcon, group, testnet: testnetList } = item
    const isSelected = this.props.selected === id
    const iconClassName = typeof icon === 'function' ? icon(isSelected) : icon || this.props.icon
    const isCustomNetwork = name === 'Custom'
    // fix old version error

    if (isNetworkModule) {
      return (
        <div key={`dropdown-item-header-${nameToId}`}
        className='cursor-default dropdown-item-network dropdown-item'
        style={{paddingRight: (isCustomNetwork && '1.75rem')}}
        onClick={event => event.preventDefault()}
      >
        <div className='d-flex justify-content-between'>
          <div className='text-overflow-dots mr-3'>
            {this.networkItemNameBody(isSelected, logoIcon, id === 'dev' ? name : group, iconClassName)}
          </div>
          {this.networkItemBtnsBody(isSelected, iconClassName, id, testnetList, item, isCustomNetwork)}
        </div>
        <div>
          {isCustomNetwork && this.customNetworkBtnsBody(testnetList)}
        </div>
      </div>
      )
    }

    return (
      <DropdownItem
        key={`dropdown-item-header-${nameToId}`}
        className={classnames({ active: isSelected })}
        onClick={event => this.onClickItem(event, item, false)}
        onContextMenu={event => {
          const isLocalProject = listDropMenu.find((elem, elIndex) =>  elem?.header === 'local projects' && (elem['index'] = elIndex));
          const isRemoteProject = listDropMenu.find((elem, elIndex) =>  elem?.header === 'remote projects' && (elem['index'] = elIndex));
          if (index < isLocalProject?.index || index > isRemoteProject?.index) {
            return null
          }
          event.preventDefault()
          this.handleContextMenu(event)
          this.setState({
            activeItem: item
          })
        }}
      >
        <div className='text-overflow-dots'>
          <span key={`dropdown-item-${isSelected}`}>
            <i className={classnames('mr-2', iconClassName)}/>
          </span>
          {name}
        </div>
      </DropdownItem>
    )
  }

  render() {
    const { list, children, right, left, contextMenu, route } = this.props
    let menus = []
    let dropdownMenuStyle = {width: 'fit-content', maxWidth: '175px', [right ? 'right' : 'left']: 4}
    if (route === 'network') dropdownMenuStyle = {width: 'auto', maxHeight: 'calc(100vh - 80px)'}

    if (Array.isArray(contextMenu)) {
      menus = contextMenu
    } else if (typeof contextMenu === 'function') {
      menus = this.activeItem?.id ? [] : contextMenu(this.activeItem?.id) || []
    }

    return (
      <ButtonDropdown
        group={false}
        className='d-flex flex-1 w-100'
        isOpen={this.state.dropdown}
        toggle={this.onToggle}
      >
        <DropdownToggle
          tag='div'
          caret
          className='nav-dropdown-toggle p-0'
          onClick={event => event.preventDefault()}
        >
          {children}
        </DropdownToggle>
        <DropdownMenu right={right}
          className={classnames(route === 'network' && 'dropdown-menu-right-auto', left && 'dropdown-menu-position-left')}
          style={{ ...dropdownMenuStyle, top: 48 }}
        >
          {this.renderDropdownList(list)}
        </DropdownMenu>
        
        {
          menus.length > 0 && <Menu animation={false} id={`nav-contextmenu-${route}`}>
          {
            menus.map(item => item ? <Item key={item.text} onClick={() => item.onClick(this.state.activeItem)}>{item.text}</Item> : <Separator />)
          }
        </Menu>
        }
      </ButtonDropdown>
    )
  }
}
