import React from "react";
import { Card } from "react-bootstrap";

import './Sink.css';
import LineSink from "./LineSink";
import { Connector } from "../connector";
import TextSink from "./TextSink";

export interface Sample {
    x: number | string | Date,
    y: number | string | Date,
}

export interface Trace {
    id: number | string,
    data: (Sample | string)[],
    [key: string]: any
}

export interface SinkProperties {
    size: {
        x: number,
        y: number,
    },
    position: {
        x: number,
        y: number,
    },
    type: 'line' | 'text',
    connector: Connector,
    sources: string[],
    [x: string]: any,
}

interface SinkState {
}

class Sink extends React.Component<SinkProperties, SinkState> {
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
            <div className="sink-wrapper" style={style}>
                <Card className="sink">
                    {
                        this.props.type === 'line'
                            ? (<LineSink sources={this.props.sources} connector={this.props.connector} />)
                            : this.props.type === 'text'
                                ? (<TextSink sources={this.props.sources} connector={this.props.connector} />)
                                : (<TextSink sources={[]} connector={this.props.connector} />)
                    }
                </Card>
            </div>
        );
    }
}

export default Sink;