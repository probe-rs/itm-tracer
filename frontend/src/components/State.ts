import { SinkProperties } from './Sink';
import App from '../App';

class State {
    state: App

    constructor(state: App) {
        this.state = state;
    }

    eval(script: string) {
        let func = new Function('sinks', '{' + script + '}');
        let sinks: SinkProperties[] = [];

        (sinks as any).add = function(x: string, y: string, w: string, h: string) {
            this.push({
                size: {
                    x: w,
                    y: h,
                },
                position: {
                    x,
                    y,
                }
            });
            console.log(sinks)
        }

        try {
            func(sinks);
        } catch(e) {
            console.error(e);
        }
        this.state.setState({ sinks });
    }
}

export default State;