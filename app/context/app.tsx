import * as React from "react"
import { createContext, useContext, useEffect, useReducer } from "react"

import { MESSAGE_TOKEN, MESSAGE_UNAUTHORIZED, ISpotifyTokens, AUTHORIZED_STATE } from "../constants"
import { SocketContext } from "./socket"
import { createActionPayload, createAction, ActionsUnion } from "./actions"

export interface IAppState {
    authorized: AUTHORIZED_STATE
    tokens: ISpotifyTokens | null
}

const DEFAULT_STATE: IAppState = {
    authorized: AUTHORIZED_STATE.UNKNOWN,
    tokens: null
}

const AppContext = createContext<[IAppState, React.Dispatch<AppActions>]>([DEFAULT_STATE, () => {}])

function reducer(state: IAppState, action: AppActions): IAppState {
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

export const AppActions = {
    onAuthorized: createActionPayload<typeof MESSAGE_TOKEN, ISpotifyTokens>(MESSAGE_TOKEN),
    onUnauthorized: createAction<typeof MESSAGE_UNAUTHORIZED>(MESSAGE_UNAUTHORIZED)
}
export type AppActions = ActionsUnion<typeof AppActions>
export { AppContext, AppProvider }
