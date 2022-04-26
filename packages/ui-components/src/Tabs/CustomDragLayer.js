import React from 'react'
import { DragLayer } from 'react-dnd'
import classnames from 'classnames'

const layerStyles = {
    position: 'fixed',
    pointerEvents: 'none',
    zIndex: 100,
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
}

function getItemStyles (initialOffset, currentOffset) {
    if (!initialOffset || !currentOffset) {
        return {
            display: 'none'
        }
    }

    const { x } = currentOffset
    const { y } = initialOffset
    const transform = `translate(${x}px, ${y}px)`
    return {
        transform,
        WebkitTransform: transform
    }
}

const CustomDragLayer = ({ item, isDragging, itemType, initialOffset, currentOffset }) => {

    function renderItem() {
        switch (itemType) {
            case 'Tab':
                return (
                    <div className="custom-drag-layer d-flex">
                        <div className={
                            classnames('custom-drag-layer-style active btn d-flex flex-row align-items-center border-0',
                                item.size && `btn-${item.size}`)
                            }
                        >
                            <span className="custom-drag-layer-original text-truncate">{item.tabText}</span>
                        </div>
                    </div>
                )

            default:
                return null
        }
    }

    if (!isDragging) {
        return null
    }

    return (
        <div style={layerStyles}>
            <div style={getItemStyles(initialOffset, currentOffset)}>{renderItem()}</div>
        </div>
    )
}

export default DragLayer((monitor) => {
    return ({
        item: monitor.getItem(),
        itemType: monitor.getItemType(),
        initialOffset: monitor.getInitialSourceClientOffset(),
        currentOffset: monitor.getSourceClientOffset(),
        isDragging: monitor.isDragging(),
    })
})(CustomDragLayer)
