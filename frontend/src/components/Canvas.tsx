import React from "react";
import styled from '@emotion/styled';
import Sink, { SinkProperties } from "./Sink";

interface Properties {
    sinks: SinkProperties[],
}

interface State {
}

class Canvas extends React.Component<Properties, State> {
    constructor(props: Properties) {
        super(props)   
    }

    render() {
        return (
            <div className="canvas">
                { this.props.sinks.map((s, i) => (
                    <Sink key={i} size={s.size} position={s.position}></Sink>
                ))}
            </div>
        );
    }
}

export default Canvas;