import { ResponsiveLine, Serie } from '@nivo/line'
import React from 'react';
import { Card } from 'react-bootstrap';
import { Trace } from './Sink';
import { timeFormat } from 'd3-time-format'

export interface LineSinkProperties {
    traces: Trace[],
    updateData: (data: any) => void,
}

export interface LineSinkState {
    data: Serie[]
}

class LineSink extends React.Component<LineSinkProperties, LineSinkState> {
    constructor(props: LineSinkProperties) {
        super(props)
    }

    formatTime(arg: any): string {
        return timeFormat('%Y %b %d')(arg)
    }

    render() {
        return (<ResponsiveLine
            data={this.props.traces as Serie[]}
            margin={{ top: 30, right: 100, bottom: 60, left: 100 }}
            xScale={{ type: 'time', format: 'native' }}
            yScale={{ type: 'linear' }}
            axisTop={{
                format: '%H:%M',
                tickValues: 'every 4 hours',
            }}
            axisBottom={{
                format: '%H:%M',
                tickValues: 'every 4 hours',
                // legend: `${this.formatTime((this.props.traces[0].data[0] as any).x)} ——— ${this.formatTime((this.props.traces[0].data[this.props.traces[0].data.length - 1] as any).x)}`,
                legendPosition: 'middle',
                legendOffset: 46,
            }}
            axisRight={{}}
            enablePoints={false}
            enableGridX={true}
            curve="monotoneX"
            animate={false}
            motionStiffness={120}
            motionDamping={50}
            isInteractive={false}
            enableSlices={false}
            useMesh={true}
            theme={{
                axis: { ticks: { text: { fontSize: 14 } } },
                grid: { line: { stroke: '#ddd', strokeDasharray: '1 2' } },
            }}
        />);
    }
}

export default LineSink;