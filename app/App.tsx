import * as React from "react"
import { useContext, useEffect } from "react"
import { normalize } from "polished"
import styled, { createGlobalStyle } from "styled-components"

import { AppProvider } from "./context/app"
import { authorize } from "./lib/spotify"
import { SocketContext } from "./context/socket"
import { CLIENT_TYPE, MESSAGE_CLIENT_TYPE, MESSAGE_TOKEN } from "./constants"

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

export interface IAppProps {
    className?: string
}

const onAuthorizeClick = async (ws: WebSocket) => {
    const tokens = await authorize()

    ws.send(
        JSON.stringify({
            payload: tokens,
            type: MESSAGE_TOKEN
        })
    )
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
            <GlobalStyles />
            <div className={props.className}>
                <header>
                    <h1>
                        <span>REVOLT</span> RADIO
                    </h1>
                </header>
                <button type="button" onClick={() => onAuthorizeClick(ws)}>
                    Authorize
                </button>
            </div>
        </AppProvider>
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
