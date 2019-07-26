import * as React from "react"
import { createContext } from "react"

export interface ISocketState {
    ws: WebSocket
}

const DEFAULT_STATE: ISocketState = {
    ws: new WebSocket(`ws://${window.location.hostname}:3001/ws`)
}

const SocketContext = createContext<ISocketState>(DEFAULT_STATE)

const SocketProvider: React.SFC = (props) => {
    return <SocketContext.Provider value={DEFAULT_STATE}>{props.children}</SocketContext.Provider>
}

export { SocketContext, SocketProvider }
