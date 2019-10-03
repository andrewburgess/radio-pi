import React from "react"
import styled from "styled-components"

import Player from "./Player"
import StationDial from "./StationDial"

const Radio = (props) => {
    return (
        <div className={props.className}>
            <Player />
            <StationDial />
        </div>
    )
}

export default styled(Radio)`
    align-self: stretch;
    display: flex;
    flex-direction: column;
    min-height: 100%;
    min-height: -webkit-fill-available;
    position: relative;
    width: 100%;

    ${Player} {
        height: calc(100% - 6rem - 20vh);
        position: absolute;
        top: 6rem;
        width: 100%;
    }

    ${StationDial} {
        bottom: 0;
        position: absolute;
    }
`
