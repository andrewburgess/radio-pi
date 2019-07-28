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
        --primary-color: #F01C20;
        --spotify: #1DB954;

        font-size: 62.5%;
    }

    html {
        background-color: #131114;
        color: #fff;
        font-family: 'Raleway', sans-serif;
    }

    html, body, #root {
        height: 100%;
        max-height: 100%;
        min-height: 320px;
    }

    body {
        font-size: 1.6rem;
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
    left: 0.5rem;
    position: fixed;
    right: 0.5rem;
    top: 0.5rem;

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
