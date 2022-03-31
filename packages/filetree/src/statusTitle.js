import React from 'react'
import PropTypes from 'prop-types'

const TYPE_COLOR = {
  error: '#D1606C',
  warning: '#D1AD60'
  // unsaved: '#FFF'
}

const StatusTitle = ({ title, isLeaf, showType, count }) => {
  return (
    <div className='status-title' style={{ 'color': `${TYPE_COLOR[showType]}` }} >
      <p style={{'margin': '0'}}> { title }</p>
      { isLeaf ? <p style={{ 'fontSize': '12px' }} >{ count }</p>
        : <div className='status-title-circleBadge' style={{ 'backgroundColor': `${TYPE_COLOR[showType]}` }} />
      }
    </div>
  )
}

export default StatusTitle

StatusTitle.propTypes = {
  isLeaf: PropTypes.bool,
  title: PropTypes.string,
  showType: PropTypes.string,
  count: PropTypes.number
}
