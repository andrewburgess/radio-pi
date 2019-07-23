import * as React from "react"
import { createContext, useEffect, useReducer } from "react"

export interface IAppState {}

const DEFAULT_STATE: IAppState = {}

const AppContext = createContext<[IAppState, React.Dispatch<any>]>([DEFAULT_STATE, () => {}])

function reducer(state: IAppState, action: any): IAppState {
    switch (action.type) {
        default:
            return state
    }
}

const AppProvider: React.SFC = (props) => {
    const [state, dispatch] = useReducer(reducer, DEFAULT_STATE)

    useEffect(() => {}, [])

    return <AppContext.Provider value={[state, dispatch]}>{props.children}</AppContext.Provider>
}

export { AppContext, AppProvider }
