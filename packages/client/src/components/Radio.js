import React from "react"
import styled from "styled-components"

import StationList from "./StationList"

const Radio = (props) => {
    return (
        <div className={props.className}>
            <StationList />
        </div>
    )
}

export default styled(Radio)`
    align-self: stretch;
    display: flex;
    flex-direction: column;
    height: 100vh;
    padding: 6rem 0 2rem;
    width: 100%;
`
