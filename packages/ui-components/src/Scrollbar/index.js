import React, { Component } from 'react';
import { Scrollbars } from 'react-custom-scrollbars-2';

export default class CustomScrollbar extends Component {

    constructor(props, ...rest) {
        super(props, ...rest);
        this.state = { top: 0, left: 0 };
        this.renderView = this.renderView.bind(this);
        this.renderThumb = this.renderThumb.bind(this);
        this.handleWheel = this.handleWheel.bind(this);
        this.scrollSelf = React.createRef()
    }

    renderView() {
        return (
            <div
                className="box"/>
        );
    }

    renderThumb() {
        const thumbStyle = {
            backgroundColor: 'rgb(255,255,255)',
            borderRadius: '5px',
        };
        return (
            <div
                style={{ ...thumbStyle }}
                />
        );
    }

    handleWheel(event) {
        //todo: optimize scroll
        event.preventDefault()
        let scrollLeft = this.scrollSelf.current.getScrollLeft()
        let wheelY = event.deltaY
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
                onWheel={this.handleWheel}
                {...this.props}>
            </Scrollbars>
        );
    }
}
