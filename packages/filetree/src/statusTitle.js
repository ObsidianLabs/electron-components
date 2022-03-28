import React from 'react'
import PropTypes from 'prop-types'

const TYPE_COLOR = {
  error: '#D1606C',
  warning: '#D1AD60'
  // unsaved: '#FFF'
}

const StatusTitle = ({ title, isLeaf, showType, error, warning }) => {
  const amount = showType === 'error' ? error : warning
  return (
    <div className='center' style={{ 'color': `${TYPE_COLOR[showType]}` }} >
      <p style={{'margin': '0'}}> { title }</p>
      { isLeaf ? <p style={{ 'fontSize': '12px' }} >{ amount }</p>
        : <div className='circleBadge' style={{ 'backgroundColor': `${TYPE_COLOR[showType]}` }} />
      }
    </div>
  )
}

export default StatusTitle

StatusTitle.propTypes = {
  isLeaf: PropTypes.bool,
  title: PropTypes.string,
  showType: PropTypes.string,
  error: PropTypes.number,
  warning: PropTypes.number
  // unsaved: PropTypes.number
}
