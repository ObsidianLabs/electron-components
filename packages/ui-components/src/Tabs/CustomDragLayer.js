import React from 'react'
import { DragLayer } from 'react-dnd';
import { Types, TabHeaderItem } from './TabHeader';
const layerStyles = {
    position: 'fixed',
    pointerEvents: 'none',
    zIndex: 100,
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
};
function getItemStyles (props) {
    const { initialOffset, currentOffset } = props
    if (!initialOffset || !currentOffset) {
        return {
            display: 'none'
        }
    }

    let { x, y } = currentOffset
    y = initialOffset.y

    const transform = `translate(${x}px, ${y}px)`
    return {
        transform: transform,
        WebkitTransform: transform
    }
}
const CustomDragLayer = (props) => {

    const { item,isDragging, itemType, } = props;

    function renderItem() {
        switch (itemType) {
            case Types.TAB:
                return (<div className='d-flex justify-content-center align-items-center dragging-tab text-truncate text-center'
                >
                    {item.tabText}
                </div>)

            default:
                return null;
        }
    }

    if (!isDragging) {
        return null;
    }

    return (<div style={layerStyles}>
			<div style={getItemStyles(props)}>{renderItem()}</div>
		</div>);
};
export default DragLayer((monitor) => {
    return ({
        item: monitor.getItem(),
        itemType: monitor.getItemType(),
        initialOffset: monitor.getInitialSourceClientOffset(),
        currentOffset: monitor.getSourceClientOffset(),
        isDragging: monitor.isDragging(),
    })
})(CustomDragLayer);
