import React, { Component } from 'react';
import { Scrollbars } from 'react-custom-scrollbars-2';

export default class CustomScrollbar extends Component {

    constructor(props, ...rest) {
        super(props, ...rest);
        this.state = { top: 0, left: 0 };
        this.scrollSelf = React.createRef()
    }

    renderView = ({ style, ...props }) => {
        return (
            <div
                className="box"
                style={{ ...style, overflowY : 'hidden', }}
                {...props}/>
        );
    }

    renderThumbHorizontal = ({ style, ...props }) => {
        const thumbStyle = {
            backgroundColor: 'rgb(255,255,255)',
            borderRadius: '5px',
            height: '63%',
            opacity: '0.2',
            position: 'absolute',
            bottom: '0',
            transition: 'all 0.5s ease-out',

        };
        return (
            <div
                style={{ ...style, ...thumbStyle }}
                {...props}/>
        );
    }

    renderTrackHorizontal = ({ style, ...props }) => {
        const trackStyle = {
            bottom: '0',
            width: '100%',
        };
        return (
            <div
                className='trackHorizontal'
                style={{ ...style, ...trackStyle }}
                {...props}/>
        );
    }

    renderTrackVertical = ({ style, ...props }) => {
        const trackStyle = {
            display: 'none',
        };
        return (
            <div
                className='trackVertical'
                style={{ ...style, ...trackStyle }}
                {...props}/>
        );
    }

    renderThumbVertical = ({ style, ...props }) => {
        const thumbStyle = {
            backgroundColor: 'rgb(255,255,255)',
            borderRadius: '5px',
            height: '63%',
            opacity: '0.2',
        };
        return (
            <div
                style={{ ...style, ...thumbStyle }}
                {...props}/>
        );
    }

    handleWheel = (event) => {
        //todo: optimize scroll
        let scrollLeft = this.scrollSelf.current.getScrollLeft()
        let wheelY = event.deltaY
        this.scrollSelf.current.scrollLeft(scrollLeft + wheelY)
    }

    render() {
        return (
            <Scrollbars
                ref={this.scrollSelf}
                autoHide
                autoHideTimeout={300}
                autoHideDuration={200}
                renderView={this.renderView}
                renderThumbHorizontal={this.renderThumbHorizontal}
                renderThumbVertical={this.renderThumbVertical}
                renderTrackHorizontal={this.renderTrackHorizontal}
                renderTrackVertical={this.renderTrackVertical}
                thumbSize={282}
                thumbMinSize={100}
                onWheel={this.handleWheel}
                {...this.props}>
            </Scrollbars>
        );
    }
}
