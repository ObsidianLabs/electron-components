import React, { Component } from 'react';
import { Scrollbars } from 'react-custom-scrollbars-2';

export default class CustomScrollbar extends Component {

    constructor(props, ...rest) {
        super(props, ...rest);
        this.state = { top: 0, left: 0 };
        this.handleUpdate = this.handleUpdate.bind(this);
        this.renderView = this.renderView.bind(this);
        this.renderThumb = this.renderThumb.bind(this);
        this.handleWheel = this.handleWheel.bind(this);
        this.scrollSelf = React.createRef()
    }

    handleUpdate(values) {
    }

    renderView({ style, ...props }) {
        const viewStyle = {};
        return (
            <div
                className="box"
                style={{ ...style, ...viewStyle }}
                {...props}/>
        );
    }

    renderThumb({ style, ...props }) {
        const thumbStyle = {
            backgroundColor: `rgb(255,255,255)`,
            width: '500px !important',
            borderRadius: '5px',
        };
        return (
            <div
                style={{ ...style, ...thumbStyle }}
                {...props}/>
        );
    }

    handleWheel(value) {
        //todo: optimize scroll
        value.preventDefault()
        let scrollLeft = this.scrollSelf.current.getScrollLeft()
        let wheelY = value.deltaY
        this.scrollSelf.current.scrollLeft(scrollLeft + wheelY)
    }

    render() {
        return (
            <Scrollbars
                ref={this.scrollSelf}
                autoHide
                autoHideTimeout={1000}
                autoHideDuration={200}
                renderView={this.renderView}
                renderThumbHorizontal={this.renderThumb}
                renderThumbVertical={this.renderThumb}
                thumbSize={500}
                thumbMinSize={500}
                onUpdate={this.handleUpdate}
                onWheel={this.handleWheel}
                {...this.props}>
            </Scrollbars>
        );
    }
}