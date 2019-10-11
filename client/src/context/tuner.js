import { each } from "lodash"
import React, { createContext, useContext, useEffect, useReducer } from "react"

import { MESSAGE_TUNER_UPDATE, RADIO_BAND } from "../constants"
import { SocketContext, consumeMessage } from "./socket"

const DEFAULT_STATE = {
    band: RADIO_BAND.AM,
    frequency: 590,
    station: null
}

const TunerContext = createContext([DEFAULT_STATE, () => {}])

const ACCEPTED_MESSAGES = [MESSAGE_TUNER_UPDATE]

function reducer(state, action) {
    switch (action.type) {
        case MESSAGE_TUNER_UPDATE: {
            return {
                ...state,
                band: action.payload.band,
                frequency: action.payload.frequency,
                station: action.payload.station
            }
        }
        default:
            return state
    }
}

const TunerProvider = (props) => {
    const [{ messages }, socketDispatch] = useContext(SocketContext)
    const [state, dispatch] = useReducer(reducer, DEFAULT_STATE)

    useEffect(() => {
        const acceptedMessages = messages.filter((message) => ACCEPTED_MESSAGES.indexOf(message.type) > -1)
        if (acceptedMessages.length) {
            each(acceptedMessages, (message) => dispatch(message))
            each(acceptedMessages, (message) => socketDispatch(consumeMessage(message)))
        }
    }, [messages, socketDispatch])

    return <TunerContext.Provider value={[state, dispatch]}>{props.children}</TunerContext.Provider>
}

export { TunerContext, TunerProvider }
