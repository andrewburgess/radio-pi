import * as React from "react"
import { createContext } from "react"

export interface ISocketState {
    ws: WebSocket
}

const SocketContext = createContext<ISocketState>({ ws: null } as any)

const SocketProvider: React.SFC = (props) => {
    const state: ISocketState = {
        ws: new WebSocket(`ws://${window.location.hostname}:3001/ws`)
    }
    return <SocketContext.Provider value={state}>{props.children}</SocketContext.Provider>
}

export { SocketContext, SocketProvider }
