import React from "react"
import { normalize } from "polished"
import { createGlobalStyle } from "styled-components"

import { AppProvider } from "./context/app"
import Header from "./components/Header"
import MainPanel from "./components/MainPanel"
import { Colors } from "./style"

const GlobalStyles = createGlobalStyle`
    ${normalize()}

    @import url('https://fonts.googleapis.com/css?family=Raleway:500,700,900&display=swap');

    :root {
        font-size: 62.5%;
    }

    html {
        background-color: ${Colors.background};
        color: #fff;
        font-family: 'Raleway', sans-serif;
    }

    html, body, #root {
        height: 100%;
        max-height: 100%;
        min-height: 320px;
        overflow: hidden;
    }

    body {
        font-size: 1.6rem;
    }

    * {
        box-sizing: border-box;
    }

    h1, h2, h3, h4, h5, h6, ul {
        margin: 0;
        padding: 0;
    }
`

const App = (props) => {
    return (
        <AppProvider>
            <>
                <GlobalStyles />
                <Header />
                <MainPanel />
            </>
        </AppProvider>
    )
}

export default App
