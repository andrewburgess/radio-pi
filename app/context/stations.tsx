import * as React from "react"
import { createContext, useEffect, useReducer } from "react"

import { createAction, ActionsUnion, createActionPayload } from "./actions"
import { IStation } from "../constants"

export interface IStationState {
    loading: boolean
    stations: IStation[]
}

const DEFAULT_STATE: IStationState = {
    loading: true,
    stations: []
}

const StationContext = createContext<[IStationState, React.Dispatch<StationActions>]>([DEFAULT_STATE, () => {}])

function reducer(state: IStationState, action: StationActions): IStationState {
    switch (action.type) {
        case ACTION_LOAD_STATIONS:
            return {
                ...state,
                loading: true
            }
        case ACTION_LOAD_STATIONS_COMPLETE:
            return {
                ...state,
                loading: false,
                stations: action.payload
            }
        default:
            return state
    }
}

const StationProvider: React.SFC = (props) => {
    const [state, dispatch] = useReducer(reducer, DEFAULT_STATE)

    useEffect(() => {}, [])

    return <StationContext.Provider value={[state, dispatch]}>{props.children}</StationContext.Provider>
}

export const ACTION_LOAD_STATIONS = "stations:load"
export const ACTION_LOAD_STATIONS_COMPLETE = "stations:load:complete"
export const ACTION_LOAD_STATIONS_ERROR = "stations:load:error"
export const StationActions = {
    loadStations: createAction<typeof ACTION_LOAD_STATIONS>(ACTION_LOAD_STATIONS),
    loadStationsComplete: createActionPayload<typeof ACTION_LOAD_STATIONS_COMPLETE, IStation[]>(
        ACTION_LOAD_STATIONS_COMPLETE
    )
}
export type StationActions = ActionsUnion<typeof StationActions>
export { StationContext, StationProvider }
