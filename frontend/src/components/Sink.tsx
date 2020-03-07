import React from "react";
import { Card } from "react-bootstrap";

import './Sink.css';
import LineSink from "./LineSink";
import { Connector, Update } from "../connector";
import { byteArrayToInt } from "../Domain";
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
    traces: Trace[],
}

class Sink extends React.Component<SinkProperties, SinkState> {
    constructor(props: SinkProperties) {
        super(props)

        this.state = {
            traces: [{
                id: 0,
                data: [],
            }],
        };
        props.connector.registerMessageHandler((data: Update) => {
            if (data.Packet && data.Packet.ItmData) {
                this.setState(state => {
                    let traces = state.traces;
                    traces[0].data.push({ x: new Date(), y: byteArrayToInt(data.Packet.ItmData.payload) })
                    return {
                        traces
                    }
                });
            }
        })
    }

    render() {
        let style = {
            width: this.props.size.x,
            height: this.props.size.y,
            left: this.props.position.x,
            top: this.props.position.y,
        }
        return (
            <Card style={style} className="sink">
                {
                    this.props.type == 'line'
                        ? (<LineSink traces={this.state.traces} updateData={(data: any) => { }} />)
                        : this.props.type == 'text'
                            ? (<TextSink sources={this.props.sources} connector={this.props.connector} />)
                            : (<TextSink sources={[]} connector={this.props.connector} />)
                }
            </Card>
        );
    }
}

export default Sink;