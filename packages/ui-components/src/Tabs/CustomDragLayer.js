import React from 'react'
import { DragLayer } from 'react-dnd';
import { Types } from './TabHeader';
import classnames from "classnames";
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
                return (<div className="custom-drag-layer d-flex">
                    <div className={
                        classnames('custom-drag-layer-box1 active btn d-flex flex-row align-items-center border-0',
                            item.size && `btn-${item.size}`)}
                    >
                        <span className="custom-drag-layer-box2 text-truncate">{item.tabText}</span>
                    </div>
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
