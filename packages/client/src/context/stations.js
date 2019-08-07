import React, { createContext, useEffect, useReducer } from "react"

export const ACTION_LOAD_STATIONS = "stations:load"
export const ACTION_LOAD_STATIONS_COMPLETE = "stations:load:complete"
export const ACTION_LOAD_STATIONS_ERROR = "stations:load:error"

export const loadStations = () => ({ type: ACTION_LOAD_STATIONS })
export const loadStationsComplete = (stations) => ({ type: ACTION_LOAD_STATIONS_COMPLETE, payload: stations })

const DEFAULT_STATE = {
    loading: true,
    stations: []
}

const StationContext = createContext([DEFAULT_STATE, () => {}])

function reducer(state, action) {
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

const StationProvider = (props) => {
    const [state, dispatch] = useReducer(reducer, DEFAULT_STATE)

    useEffect(() => {
        dispatch(loadStations())

        const fetchStations = async () => {
            const response = await fetch("/api/stations")
            const stations = await response.json()

            dispatch(loadStationsComplete(stations))
        }

        fetchStations()
    }, [])

    return <StationContext.Provider value={[state, dispatch]}>{props.children}</StationContext.Provider>
}

export { StationContext, StationProvider }
