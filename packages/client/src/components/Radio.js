import React from "react"
import styled from "styled-components"

import Player from "./Player"
import StationList from "./StationList"

const Radio = (props) => {
    return (
        <div className={props.className}>
            <StationList />
            <Player />
        </div>
    )
}

export default styled(Radio)`
    align-self: stretch;
    display: flex;
    flex-direction: column;
    height: 100vh;
    padding: 6rem 0 0;
    width: 100%;
`
