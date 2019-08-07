import React, { createContext } from "react"

const SocketContext = createContext({ ws: null })

const SocketProvider = (props) => {
    const state = {
        ws: new WebSocket(`ws://${window.location.hostname}:3001/ws`)
    }
    return <SocketContext.Provider value={state}>{props.children}</SocketContext.Provider>
}

export { SocketContext, SocketProvider }
