import * as React from "react"
import { createContext, useContext, useEffect, useReducer } from "react"

import { MESSAGE_TOKEN, MESSAGE_UNAUTHORIZED } from "../constants"
import { SocketContext } from "./socket"

export interface IAppState {
    authorized: boolean | null
}

const DEFAULT_STATE: IAppState = {
    authorized: null
}

const AppContext = createContext<[IAppState, React.Dispatch<any>]>([DEFAULT_STATE, () => {}])

function reducer(state: IAppState, action: any): IAppState {
    switch (action.type) {
        case MESSAGE_TOKEN:
            return {
                ...state,
                authorized: true
            }
        case MESSAGE_UNAUTHORIZED:
            return {
                ...state,
                authorized: false
            }
        default:
            return state
    }
}

const AppProvider: React.SFC = (props) => {
    const { ws } = useContext(SocketContext)
    const [state, dispatch] = useReducer(reducer, DEFAULT_STATE)

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            const message = JSON.parse(event.data)
            dispatch(message)
        }
        ws.addEventListener("message", handleMessage)

        return () => ws.removeEventListener("message", handleMessage)
    }, [ws])

    return <AppContext.Provider value={[state, dispatch]}>{props.children}</AppContext.Provider>
}

export { AppContext, AppProvider }
