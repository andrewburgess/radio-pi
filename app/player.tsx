import isElectron from "is-electron"
import { normalize } from "polished"
import * as React from "react"
import * as ReactDOM from "react-dom"
import { createGlobalStyle } from "styled-components"

import { Player as SpotifyPlayer } from "./types/spotify"
import { PlayerEvents } from "./lib/spotify"
import { CLIENT_TYPE, MESSAGE_CLIENT_TYPE, MESSAGE_TOKEN, MESSAGE_REQUEST_TOKEN } from "./constants"

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
        <div>
            <Style />
        </div>
    )
}

let player: SpotifyPlayer
const ws = new WebSocket(`ws://${window.location.hostname}:3001/ws`)

ws.addEventListener("open", () => {
    ws.send(
        JSON.stringify({
            payload: CLIENT_TYPE.PLAYER,
            type: MESSAGE_CLIENT_TYPE
        })
    )
})

window.onSpotifyWebPlaybackSDKReady = () => {
    player = new window.Spotify.Player({
        name: "REVOLT Radio",
        getOAuthToken: async (cb) => {
            ws.addEventListener("message", (event) => {
                const message = JSON.parse(event.data)

                if (message.type === MESSAGE_TOKEN) {
                    event.preventDefault()
                    event.stopPropagation()

                    cb(message.payload.access_token)
                }
            })

            ws.send(
                JSON.stringify({
                    type: MESSAGE_REQUEST_TOKEN
                })
            )
        }
    })

    player.addListener(PlayerEvents.READY, ({ device_id }: any) => {})

    player.connect()
}

const script = document.createElement("script")
script.src = "https://sdk.scdn.co/spotify-player.js"
document.getElementsByTagName("head")[0].append(script)

ReactDOM.render(<Player />, document.getElementById("root"))
