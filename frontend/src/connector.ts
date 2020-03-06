import { Dwt } from "./arm/components";

export enum DwtMode {
    Memory = 'Memory',
}

export interface Update {
    Packet: {
        Sync: {},
        Overflow: {},
        TimeStamp: {
            tc: number,
            ts: number,
        },
        ItmData: {
            id: number,
            payload: number[],
        },
        DwtData: {
            id: number,
            payload: number[],
        },
    },
    Information: {
        dwt: {
            units: [{
                mode: DwtMode,
                address: number,
                active: boolean,
            }]
        }
    }
}

export enum Command {
    Nop = 'Nop',
}

export class Connector {
    state: {
        loading: boolean,
        socket?: WebSocket,
        messageHandlers: ((data: Update) => void)[]
        closeHandlers: (() => void)[]
        openHandlers: (() => void)[]
    }

    constructor() {
        this.state = {
            loading: true,
            socket: undefined,
            messageHandlers: [],
            closeHandlers: [],
            openHandlers: [],
        };

        // Open an initial socket.
        this.onclose();
    }

    registerMessageHandler(handler: (data: Update) => void) {
        this.state.messageHandlers.push(handler)
    }

    registerCloseHandlers(handler: () => void) {
        this.state.closeHandlers.push(handler)
    }

    registerOpenHandlers(handler: () => void) {
        this.state.openHandlers.push(handler)
    }

    onmessage(event: MessageEvent) {
        let data = JSON.parse(event.data) as Update;
        
        this.state.messageHandlers.forEach(handler => {
            handler(data)
        });

        // if(data.Packet && data.Packet.DwtData) {
        //     if(data.Packet.DwtData.id == 17) {
        //         let value = byteArrayToInt(data.Packet.DwtData.payload);
        //         vnode.state.dwt_traces[0].push(value);
        //         m.redraw();
        //     } else {
        //         console.log(data.Packet.DwtData.id);
        //     }
        //     console.log(data.Packet.DwtData)
        // }
        // if(data.Packet && data.Packet.ItmData) {
        //     let incomming = "";
        //     for(let i = 0; i < data.Packet.ItmData.payload.length; i++) {
        //         let byte = data.Packet.ItmData.payload[i];
        //         incomming += String.fromCharCode(byte);
        //     }
        //     vnode.state.log[data.Packet.ItmData.id] += incomming.replace("\n", "<br>");
        //     m.redraw();
        // }
    }

    onclose() {
        let me = this;

        this.state.closeHandlers.forEach(handler => {
            handler()
        });

        // Set the loading state to true.
        this.state.loading = true;

        // Open the websocket.
        this.state.socket = new WebSocket('ws://127.0.0.1:1337');

        // When the socket is open, leave loading state.
        this.state.socket.onopen = _ => me.onopen();

        // When we get a message, update all our content.
        this.state.socket.onmessage = event => me.onmessage(event);

        // When the socket is closed, try to reopen it. Meanwhile don't render our panels.
        this.state.socket.onclose = _ => me.onclose();
    }

    onopen() {
        // We are not loading anymore.
        this.state.loading = false;

        this.state.openHandlers.forEach(handler => {
            handler()
        });
    }
};