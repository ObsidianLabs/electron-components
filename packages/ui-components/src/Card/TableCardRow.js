import React from 'react'
import {
  Badge,
  UncontrolledTooltip
} from 'reactstrap'

export default function TableCardRow ({
  name,
  icon,
  right,
  badge,
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
            <Badge
              pill
              id={id}
              color={badgeColor}
              style={{ cursor: tooltip ? 'pointer' : undefined }}
              onClick={onClickBadge}
            >{badge}</Badge>
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