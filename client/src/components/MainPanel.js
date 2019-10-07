import classnames from "classnames"
import React from "react"
import styled from "styled-components"

import { AUTHORIZED_STATE } from "../constants"

import { AppContext } from "../context/app"
import { PlayerProvider } from "../context/player"
import { StationProvider } from "../context/stations"
import Authorize from "./Authorize"
import Radio from "./Radio"

const MainPanel = (props) => {
    const [context] = React.useContext(AppContext)

    if (context.authorized === AUTHORIZED_STATE.UNKNOWN) {
        return <div className={classnames(props.className, "loading")}>Loading...</div>
    }

    return (
        <div
            className={classnames(props.className, { authorize: context.authorized === AUTHORIZED_STATE.UNAUTHORIZED })}
        >
            {context.authorized === AUTHORIZED_STATE.AUTHORIZED ? (
                <StationProvider>
                    <PlayerProvider>
                        <Radio />
                    </PlayerProvider>
                </StationProvider>
            ) : (
                <Authorize />
            )}
        </div>
    )
}

export default styled(MainPanel)`
    height: 100%;
    margin: 0 auto;
    width: 100%;

    &.authorize,
    &.loading {
        align-items: center;
        display: flex;
        font-size: 2.5rem;
        font-weight: 900;
        justify-content: center;
        text-transform: uppercase;
    }
`
