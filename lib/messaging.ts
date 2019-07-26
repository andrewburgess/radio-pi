import { IncomingMessage } from "http"
import { each } from "lodash"
import * as WebSocket from "ws"

import {
    MESSAGE_CLIENT_TYPE,
    CLIENT_TYPE,
    MESSAGE_TOKEN,
    MESSAGE_REQUEST_TOKEN,
    ISpotifyTokens
} from "../app/constants"

// General list of connected clients
const clients: WebSocket[] = []
// Clients that have identified as players
const players: WebSocket[] = []
// Clients that have identified as remotes
const remotes: WebSocket[] = []

let tokens: ISpotifyTokens | null

const onClientTypeMessage = (ws: WebSocket, message: any) => {
    if (message.payload === CLIENT_TYPE.PLAYER) {
        console.log("player connected to server")
        players.push(ws)
    } else if (message.payload === CLIENT_TYPE.REMOTE) {
        console.log("remote connected to server")
        remotes.push(ws)
    }
}

function handleMessage(ws: WebSocket, message: any) {
    switch (message.type) {
        case MESSAGE_CLIENT_TYPE:
            return onClientTypeMessage(ws, message)
        case MESSAGE_TOKEN:
            tokens = message.payload
            each(players, (player) => {
                player.send(JSON.stringify(message))
            })
            break
        case MESSAGE_REQUEST_TOKEN:
            if (tokens) {
                each(players, (player) =>
                    player.send(
                        JSON.stringify({
                            payload: tokens,
                            type: MESSAGE_TOKEN
                        })
                    )
                )
            }
            break
        default:
            console.log("unknown message type", message)
    }
}

export function onConnection(ws: WebSocket, req: IncomingMessage) {
    clients.push(ws)

    ws.on("message", (data: WebSocket.Data) => {
        if (typeof data === "string") {
            handleMessage(ws, JSON.parse(data))
        }
    })

    ws.on("close", () => {
        clients.splice(clients.indexOf(ws, 1))

        if (players.indexOf(ws) > -1) {
            console.log("player disconnected to server")
            players.splice(players.indexOf(ws, 1))
        }

        if (remotes.indexOf(ws) > -1) {
            console.log("remote disconnected to server")
            remotes.splice(remotes.indexOf(ws, 1))
        }
    })
}
