import React from "react";
import Sink, { SinkProperties } from "./Sink";

import './Canvas.css'

interface Properties {
    sinks: SinkProperties[],
}

interface State {
}

class Canvas extends React.Component<Properties, State> {
    // constructor(props: Properties) {
    //     super(props)
    // }

    render() {
        return (
            <div className="canvas">
                {this.props.sinks.map((s, i) => (
                    <Sink
                        key={i}
                        size={s.size}
                        position={s.position}
                        type={s.type}
                        connector={s.connector}
                        sources={s.sources}
                    ></Sink>
                ))}
            </div>
        );
    }
}

export default Canvas;