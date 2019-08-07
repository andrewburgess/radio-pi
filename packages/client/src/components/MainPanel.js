import classnames from "classnames"
import React from "react"
import styled from "styled-components"

import { AUTHORIZED_STATE } from "@revolt-radio/common"

import { AppContext } from "../context/app"
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
                    <Radio />
                </StationProvider>
            ) : (
                <Authorize />
            )}
        </div>
    )
}

export default styled(MainPanel)`
    height: 100%;
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
