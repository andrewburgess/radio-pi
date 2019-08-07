import React, { createContext, useContext, useEffect, useReducer } from "react"

import { MESSAGE_TOKEN, MESSAGE_UNAUTHORIZED, AUTHORIZED_STATE } from "@revolt-radio/common"

import { SocketContext } from "./socket"

const DEFAULT_STATE = {
    authorized: AUTHORIZED_STATE.UNKNOWN,
    tokens: null
}

const AppContext = createContext([DEFAULT_STATE, () => {}])

function reducer(state, action) {
    switch (action.type) {
        case MESSAGE_TOKEN:
            return {
                ...state,
                authorized: AUTHORIZED_STATE.AUTHORIZED,
                tokens: action.payload
            }
        case MESSAGE_UNAUTHORIZED:
            return {
                ...state,
                authorized: AUTHORIZED_STATE.UNAUTHORIZED,
                tokens: null
            }
        default:
            return state
    }
}

const AppProvider = (props) => {
    const { ws } = useContext(SocketContext)
    const [state, dispatch] = useReducer(reducer, DEFAULT_STATE)

    useEffect(() => {
        const handleMessage = (event) => {
            const message = JSON.parse(event.data)
            dispatch(message)
        }
        ws.addEventListener("message", handleMessage)

        return () => ws.removeEventListener("message", handleMessage)
    }, [ws])

    return <AppContext.Provider value={[state, dispatch]}>{props.children}</AppContext.Provider>
}

export const onAuthorized = (tokens) => ({ type: MESSAGE_TOKEN, payload: tokens })
export const onUnauthorized = () => ({ type: MESSAGE_UNAUTHORIZED })

export { AppContext, AppProvider }
