import React from 'react';
import { Card, Container, Button, Form } from 'react-bootstrap';
import { Connector, Update, DwtMode } from '../connector';
import { SinkProperties } from './Sink';
import State from './State'
import { byteArrayToInt } from '../Domain';

import './Sidebar.css';

let SINKS: SinkProperties[] = [];

interface Properties {
    cards: any[],
    connector: Connector,
    sinks: SinkProperties[],
    state: State,
}

interface SidebarState {
    dwt: {
        units: {
            mode: DwtMode,
            address: number,
            active: boolean,
            data: any[],
        }[]
    },
    script: string,
}

class Sidebar extends React.Component<Properties, SidebarState> {
    constructor(props: Properties) {
        super(props)

        this.state = {
            dwt: {
                units: [],
            },
            script: `\
sinks.add({
    x: '0%',
    y: '0%',
    w: '70%',
    h: '70%'
})
sinks.add({
    x: '0%',
    y: '50%',
    w: '70%',
    h: '50%'
})
sinks.add({
    x: '70%',
    y: '0%',
    w: '30%',
    h: '50%',
    type: 'text',
    sources: ['itm-0'],
})
sinks.add({
    x: '70%',
    y: '50%',
    w: '30%',
    h: '50%',
    type: 'text',
    sources: ['itm-1'],
})`,
        };

        SINKS = props.sinks;

        this.messageHandler = this.messageHandler.bind(this);
        this.onConnectMock = this.onConnectMock.bind(this);
        this.eval = this.eval.bind(this);

        props.connector.registerMessageHandler(this.messageHandler);
        props.connector.registerOpenHandlers(this.onConnectMock);
    }

    messageHandler(update: Update) {
        if (update.Information) {
            const info = update.Information;
            this.setState(state => ({
                dwt: {
                    units: info.dwt.units.map(({ mode, address, active }) => ({ mode, address, active, data: [], }))
                },
            }))
        }

        if (update.Packet && update.Packet.DwtData) {
            const data = update.Packet.DwtData;

            if (data.id == 17) {
                let value = byteArrayToInt(data.payload);
                this.state.dwt.units[0].data.push(value);
            }
        }
    }

    onConnectMock() {
        this.setState(_state => ({
            dwt: {
                units: [{
                    mode: DwtMode.Memory,
                    address: 0x2000_3000,
                    active: true,
                    data: [],
                }, {
                    mode: DwtMode.Memory,
                    address: 0x2000_3000,
                    active: false,
                    data: [],
                }, {
                    mode: DwtMode.Memory,
                    address: 0x2000_3000,
                    active: false,
                    data: [],
                }, {
                    mode: DwtMode.Memory,
                    address: 0x2000_3000,
                    active: false,
                    data: [],
                }],
            }
        }))
    }

    eval(_event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        this.props.state.eval(this.state.script);
    }

    render() {
        return (
            <Container className="d-flex flex-grow-1 flex-column h-100">
                {this.state.dwt.units.map((unit, i) => {
                    return (
                        <div key={i}></div>
                    )
                })}
                <Card className="d-flex flex-grow-1 flex-column">
                    <Form.Group className="d-flex flex-grow-1 flex-column">
                        <Form.Label>Config</Form.Label>
                        <Form.Control
                            as="textarea"
                            className="code-area d-flex flex-grow-1 flex-column"
                            value={this.state.script}
                            onChange={
                                e => this.setState({
                                    script: (e.target as any).value
                                })
                            }
                        />
                    </Form.Group>
                    <Button onClick={this.eval}>Load</Button>
                </Card>
            </Container>
        )
    }
}

export default Sidebar;