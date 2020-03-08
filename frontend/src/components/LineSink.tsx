import { ResponsiveLineCanvas, Serie } from '@nivo/line'
import React from 'react';
import { timeFormat } from 'd3-time-format'
import { Connector, Update } from '../connector';
import { byteArrayToInt } from '../Domain';

export interface LineSinkProperties {
    sources: string[],
    connector: Connector,
}

export interface LineSinkState {
    traces: Serie[],
}

class LineSink extends React.Component<LineSinkProperties, LineSinkState> {
    constructor(props: LineSinkProperties) {
        super(props)

        this.state = {
            traces: props.sources.map(source => ({
                id: source,
                data: [],
            })),
        };


        let me = this;
        let wsUpdater = function (id: string, data: Update) {
            me.setState(state => {
                let traces = state.traces;
                traces.find(trace => trace.id === id)!.data.push({ x: new Date(), y: data.Packet.MemoryTrace.value })
                return {
                    traces
                }
            });
        }
        props.sources.forEach(source => props.connector.registerMessageHandler(source, (id, update) => wsUpdater(id, update)));
    }

    formatTime(arg: any): string {
        return timeFormat('%Y %b %d')(arg)
    }

    render() {
        return (<ResponsiveLineCanvas
            data={this.state.traces}
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
            isInteractive={false}
            enableSlices={false}
            theme={{
                axis: { ticks: { text: { fontSize: 14 } } },
                grid: { line: { stroke: '#ddd', strokeDasharray: '1 2' } },
            }}
        />);
    }
}

export default LineSink;