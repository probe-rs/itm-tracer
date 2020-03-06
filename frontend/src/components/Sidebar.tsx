import React from 'react';
import { Card, Container, Button, Form } from 'react-bootstrap';
import { Connector, Update, DwtMode } from '../connector';
import { SinkProperties } from './Sink';
import State from './State'

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
            script: '',
        };

        SINKS = props.sinks;

        this.messageHandler = this.messageHandler.bind(this);
        this.onConnectMock = this.onConnectMock.bind(this);
        this.eval = this.eval.bind(this);

        props.connector.registerMessageHandler(this.messageHandler);
        props.connector.registerOpenHandlers(this.onConnectMock);
    }

    messageHandler(update: Update) {
        if(update.Information) {
            const info = update.Information;
            this.setState(state => ({
                dwt: {
                    units: info.dwt.units.map(({ mode, address, active }) => ({ mode, address, active, data: [], }))
                },
            }))
        }

        if(update.Packet && update.Packet.DwtData) {
            const data = update.Packet.DwtData;

            if(data.id == 17) {
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

    eval(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        console.log('EVAL');
        console.log(this.state.script);
        this.props.state.eval(this.state.script);
    }

    render() {
        return (
            <Container>
                {this.state.dwt.units.map((unit, id) => {
                    return (
                        <div></div>
                    )
                })}
                <Card>
                    <Form.Group controlId="">
                        <Form.Label>Config</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows="5"
                            value={ this.state.script }
                            onChange={
                                e => this.setState({
                                    script: (e.target as any).value
                                })
                            }
                        />
                    </Form.Group>
                    <Button onClick={ this.eval }>Load</Button>
                </Card>
            </Container>
        )
    }
}

function byteArrayToInt(byteArray: number[]) {
    var value = 0;
    for ( var i = byteArray.length - 1; i >= 0; i--) {
        value = (value * 256) + byteArray[i];
    }

    return value;
};

export default Sidebar;