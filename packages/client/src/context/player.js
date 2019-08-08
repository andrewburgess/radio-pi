import { each } from "lodash"
import React, { createContext, useContext, useEffect, useReducer } from "react"

import { MESSAGE_PLAYER_CONNECTED, MESSAGE_PLAYER_DISCONNECTED } from "@revolt-radio/common"

import { SocketContext, consumeMessage } from "./socket"

const DEFAULT_STATE = {
    deviceId: null
}

const PlayerContext = createContext([DEFAULT_STATE, () => {}])

const ACCEPTED_MESSAGES = [MESSAGE_PLAYER_CONNECTED, MESSAGE_PLAYER_DISCONNECTED]

function reducer(state, action) {
    switch (action.type) {
        case MESSAGE_PLAYER_CONNECTED:
            return {
                ...state,
                deviceId: action.payload
            }
        case MESSAGE_PLAYER_DISCONNECTED:
            return {
                ...state,
                deviceId: state.deviceId === action.payload ? null : state.deviceId
            }
        default:
            return state
    }
}

const PlayerProvider = (props) => {
    const [{ messages }, socketDispatch] = useContext(SocketContext)
    const [state, dispatch] = useReducer(reducer, DEFAULT_STATE)

    useEffect(() => {
        const acceptedMessages = messages.filter((message) => ACCEPTED_MESSAGES.indexOf(message.type) > -1)
        if (acceptedMessages.length) {
            each(acceptedMessages, (message) => dispatch(message))
            each(acceptedMessages, (message) => socketDispatch(consumeMessage(message)))
        }
    }, [messages])

    return <PlayerContext.Provider value={[state, dispatch]}>{props.children}</PlayerContext.Provider>
}

export { PlayerContext, PlayerProvider }
