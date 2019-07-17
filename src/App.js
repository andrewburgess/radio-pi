import React from "react"
import { normalize } from "polished"
import styled, { createGlobalStyle } from "styled-components"

import { PlayerProvider } from "./context/player"

const GlobalStyles = createGlobalStyle`
    ${normalize()}

    @import url('https://fonts.googleapis.com/css?family=Raleway:500,700,900&display=swap');

    :root {
        --primary-color: #f01c20;
    }

    html {
        background-color: #131114;
        color: #fff;
        font-family: 'Raleway', sans-serif;
    }
`

function App(props) {
    return (
        <PlayerProvider>
            <GlobalStyles />
            <div className={props.className}>
                <header>
                    <h1>
                        <span>REVOLT</span> RADIO
                    </h1>
                </header>
            </div>
        </PlayerProvider>
    )
}

export default styled(App)`
    h1 {
        font-weight: 900;
        text-align: center;

        span {
            color: var(--primary-color);
        }
    }
`
