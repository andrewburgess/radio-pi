import { each } from "lodash"
import React, { createContext, useContext, useEffect, useReducer } from "react"

import { MESSAGE_TOKEN, MESSAGE_UNAUTHORIZED, AUTHORIZED_STATE } from "@revolt-radio/common"

import { SocketContext, consumeMessage } from "./socket"

const DEFAULT_STATE = {
    authorized: AUTHORIZED_STATE.UNKNOWN,
    tokens: null
}

const AppContext = createContext([DEFAULT_STATE, () => {}])

const ACCEPTED_MESSAGES = [MESSAGE_TOKEN, MESSAGE_UNAUTHORIZED]

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
    const [{ messages }, socketDispatch] = useContext(SocketContext)
    const [state, dispatch] = useReducer(reducer, DEFAULT_STATE)

    useEffect(() => {
        const acceptedMessages = messages.filter((message) => ACCEPTED_MESSAGES.indexOf(message.type) > -1)
        if (acceptedMessages.length) {
            each(acceptedMessages, (message) => dispatch(message))
            each(acceptedMessages, (message) => socketDispatch(consumeMessage(message)))
        }
    }, [messages, socketDispatch])

    return <AppContext.Provider value={[state, dispatch]}>{props.children}</AppContext.Provider>
}

export const onAuthorized = (tokens) => ({ type: MESSAGE_TOKEN, payload: tokens })
export const onUnauthorized = () => ({ type: MESSAGE_UNAUTHORIZED })

export { AppContext, AppProvider }
