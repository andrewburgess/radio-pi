import isElectron from "is-electron"
import { normalize } from "polished"
import * as React from "react"
import * as ReactDOM from "react-dom"
import { createGlobalStyle } from "styled-components"

import { PlayerProvider } from "./context/player"

const Style = createGlobalStyle`
    ${normalize()}

    @import url('https://fonts.googleapis.com/css?family=Raleway:500,700,900&display=swap');
    
    html {
        background-color: #131114;
        color: #fff;
        font-family: 'Raleway', sans-serif;
        height: 100%;
        width: 100%;
    }

    body {
        align-items: center;
        display: flex;
        height: 100%;
        justify-content: center;
    }

    .warning {
        font-size: 3rem;
    }
`

const Player = () => {
    if (!isElectron()) {
        return (
            <>
                <Style />
                <h1 className="warning">THIS NEEDS TO RUN IN ELECTRON</h1>
            </>
        )
    }

    return (
        <PlayerProvider>
            <Style />
        </PlayerProvider>
    )
}

ReactDOM.render(<Player />, document.getElementById("root"))
