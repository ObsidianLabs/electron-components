import React from 'react'
import { UncontrolledTooltip } from 'reactstrap'
import Badge from '../ported/Badge'

export default function TableCardRow ({
  name,
  icon,
  right,
  badge,
  badgeList = [badge],
  badgeColor = 'secondary',
  tooltip = null,
  onClickBadge = () => {},
  loading,
  children
}) {
  const id = `table-card-row-${Math.floor(Math.random() * 1000)}`
  return (
    <tr>
      <td>
        <div className='d-flex justify-content-between align-items-center flex-wrap'>
          <div className='d-flex flex-row'>
            {icon && <div key={`icon-${icon}`}><i className={`w-3 mr-2 ${icon}`} /></div>}
            {name}
          </div>
          {
            right ||
            <div>
              {
                badgeList.map((elem, elIndex) => {
                  const elemId = Math.floor(Math.random() * 1000)
                  const itemClassName = !badge && elIndex === (badgeList.length - 1) && 'ml-2'
                  return (
                    <Badge
                      pill
                      id={`${id}${!badge && elemId}`}
                      color={badgeColor}
                      className={itemClassName}
                      style={{ cursor: tooltip ? 'pointer' : undefined }}
                      onClick={onClickBadge}
                    >{elem}</Badge>
                  )
                })
              }
            </div>
          }
          {
            loading &&
            <Badge pill color={badgeColor}>
              <span><i className="fas fa-spinner fa-pulse"/></span>
            </Badge>
          }
          {
            tooltip &&
            <UncontrolledTooltip delay={0} target={id} placement='top' >
              {tooltip}
            </UncontrolledTooltip>
          }
        </div>
        {children}
      </td>
    </tr>
  )
}