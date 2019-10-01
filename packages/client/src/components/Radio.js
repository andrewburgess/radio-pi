import React from "react"
import styled from "styled-components"

import StationDial from "./StationDial"

const Radio = (props) => {
    return (
        <div className={props.className}>
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
    padding: 6rem 0 0;
    position: relative;
    width: 100%;

    ${StationDial} {
        bottom: 0;
        position: absolute;
    }
`
