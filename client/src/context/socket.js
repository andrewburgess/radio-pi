import React, { createContext, useEffect, useReducer } from "react"

import { CLIENT_TYPE, MESSAGE_CLIENT_TYPE } from "../constants"

const INITIALIZE = "socket:initialize"
const ON_MESSAGE = "socket:onmessage"
const CONSUME_MESSAGE = "socket:consume-message"

const SocketContext = createContext({ ws: null })

const DEFAULT_STATE = {
    messages: [],
    ws: null
}

function reducer(state, action) {
    switch (action.type) {
        case CONSUME_MESSAGE:
            return {
                ...state,
                messages: state.messages.filter((message) => message !== action.payload)
            }
        case INITIALIZE:
            return {
                ...state,
                ws: action.payload
            }
        case ON_MESSAGE:
            return {
                ...state,
                messages: [...state.messages, action.payload]
            }
        default:
            return state
    }
}

const SocketProvider = (props) => {
    const [state, dispatch] = useReducer(reducer, DEFAULT_STATE)

    useEffect(() => {
        const ws = new WebSocket(`ws://${window.location.hostname}:3001/ws`)

        const notify = () =>
            ws.send(
                JSON.stringify({
                    payload: CLIENT_TYPE.REMOTE,
                    type: MESSAGE_CLIENT_TYPE
                })
            )
        if (ws.readyState === WebSocket.OPEN) {
            notify()
        } else {
            ws.addEventListener("open", () => notify())
        }

        ws.addEventListener("message", (event) => {
            dispatch({
                type: ON_MESSAGE,
                payload: JSON.parse(event.data)
            })
        })

        dispatch({
            type: INITIALIZE,
            payload: ws
        })
    }, [])

    return <SocketContext.Provider value={[state, dispatch]}>{props.children}</SocketContext.Provider>
}

export { SocketContext, SocketProvider }
export const consumeMessage = (message) => ({ type: CONSUME_MESSAGE, payload: message })
