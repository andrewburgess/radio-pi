import * as React from "react"
import { useContext, useEffect } from "react"
import { normalize } from "polished"
import styled, { createGlobalStyle } from "styled-components"

import { AppProvider } from "./context/app"
import { SocketContext } from "./context/socket"
import { CLIENT_TYPE, MESSAGE_CLIENT_TYPE } from "./constants"
import MainPanel from "./components/MainPanel"

const GlobalStyles = createGlobalStyle`
    ${normalize()}

    @import url('https://fonts.googleapis.com/css?family=Raleway:500,700,900&display=swap');

    :root {
        --background-color: #131114;
        --primary-color: #F01C20;
        --spotify: #1DB954;

        font-size: 62.5%;
    }

    html {
        background-color: var(--background-color);
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

export interface IAppProps {
    className?: string
}

const App: React.SFC<IAppProps> = (props) => {
    const { ws } = useContext(SocketContext)

    useEffect(() => {
        const notify = () =>
            ws.send(
                JSON.stringify({
                    payload: CLIENT_TYPE.REMOTE,
                    type: MESSAGE_CLIENT_TYPE
                })
            )
        if (ws.readyState === WebSocket.OPEN) {
            notify()
        }
        ws.addEventListener("open", () => notify())
    }, [ws])

    return (
        <AppProvider>
            <>
                <GlobalStyles />
                <header className={props.className}>
                    <h1>
                        <span>REVOLT</span> RADIO
                    </h1>
                </header>
                <MainPanel />
            </>
        </AppProvider>
    )
}

export default styled(App)`
    background-color: var(--background-color);
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
        color: var(--primary-color);
    }
`
