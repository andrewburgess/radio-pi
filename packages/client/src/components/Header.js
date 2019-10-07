import React from "react"
import styled from "styled-components"

import { Colors } from "../style"

const Header = (props) => {
    return (
        <header className={props.className}>
            <h1>
                <span>RADIO</span> PI
            </h1>
        </header>
    )
}

export default styled(Header)`
    background-color: ${Colors.background};
    left: 0;
    padding: 0.5rem;
    position: fixed;
    top: 0;
    max-width: 100vw;
    width: 100%;

    h1 {
        font-size: 3rem;
        font-weight: 900;
        margin: 0;
        text-align: center;
    }

    h1 > span {
        color: ${Colors.primary};
    }
`
