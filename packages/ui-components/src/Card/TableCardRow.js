import React from 'react'
import {
  Badge,
  UncontrolledTooltip
} from 'reactstrap'

export default function TableCardRow ({
  name,
  icon,
  badge,
  badgeColor = 'secondary',
  tooltip = null,
  onClickBadge = () => {},
  children
}) {
  const id = `table-card-row-${Math.floor(Math.random() * 1000)}`
  return (
    <tr>
      <td>
        <div className='d-flex justify-content-between align-items-center'>
          <div className='d-flex flex-row'>
            <div key={`icon-${icon}`}>
              <i className={`w-3 mr-2 ${icon}`} />
            </div>
            {name}
          </div>
          <Badge
            pill
            id={id}
            color={badgeColor}
            style={{ cursor: tooltip ? 'pointer' : undefined }}
            onClick={onClickBadge}
          >{badge}</Badge>
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