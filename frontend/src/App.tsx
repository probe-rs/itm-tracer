import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes, faBars } from '@fortawesome/free-solid-svg-icons';
import Sidebar from './components/Sidebar';
import { Connector } from './connector';
import Canvas from './components/Canvas';
import { SinkProperties } from './components/Sink';
import State from './components/State';

interface AppState {
    sidebarVisible: boolean,
    cards: any[],
    connector: Connector,
    sinks: SinkProperties[],
}

class App extends React.Component<{}, AppState> {
    appState: State

    constructor(props: any) {
        super(props);
        this.state = {
            sidebarVisible: true,
            cards: [],
            connector: new Connector(),
            sinks: [{
                size: {
                    x: 400,
                    y: 500,
                },
                position: {
                    x: 40,
                    y: 50,
                }
            }],
        };
        this.appState = new State(this);
        this.hideSidebar = this.hideSidebar.bind(this);
    }
    
    hideSidebar() {
        this.setState(state => ({
            sidebarVisible: !state.sidebarVisible,
        }))
    }

    render() {
        return (
            <div className="layout">
                <Canvas sinks={this.state.sinks}/>
                <div className={"sidebar " + (this.state.sidebarVisible
                        ? "sidebar-visible"
                        : "sidebar-hidden")
                    }>
                    <button
                        type="button"
                        className="btn btn-primary rounded-circle close-button"
                        onClick={ this.hideSidebar }
                    >
                        <FontAwesomeIcon icon={ this.state.sidebarVisible ? faTimes : faBars } />
                    </button>

                    <div className="sidebar-content">
                        <Sidebar
                            cards={ this.state.cards }
                            connector={ this.state.connector }
                            sinks={ this.state.sinks }
                            state={ this.appState }
                        ></Sidebar>
                    </div>
                </div>
            </div>
        );
    }
}

export default App;
