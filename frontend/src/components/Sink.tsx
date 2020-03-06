import React from "react";
import { Card } from "react-bootstrap";

import './Sink.css';

export interface SinkProperties {
    size: {
        x: number,
        y: number,
    },
    position: {
        x: number,
        y: number,
    }
}

class Sink extends React.Component<SinkProperties> {
    constructor(props: SinkProperties) {
        super(props)
    }

    render() {
        let style = {
            width: this.props.size.x,
            height: this.props.size.y,
            left: this.props.position.x,
            top: this.props.position.y,
        }
        return (
            <Card style={style} className="sink"></Card>
        );
    }
}

export default Sink;