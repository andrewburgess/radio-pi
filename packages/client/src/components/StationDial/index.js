import React from "react"
import styled from "styled-components"

import Dial from "./Dial"

const StationDial = (props) => {
    return (
        <div className={props.className}>
            <Dial />
        </div>
    )
}

export default styled(StationDial)`
    height: 20vh;
    overflow: hidden;
    width: 100%;

    ${Dial} {
        bottom: 0;
        left: 0;
        position: absolute;
        right: 0;
        top: 0;
        z-index: 1;
    }
`
