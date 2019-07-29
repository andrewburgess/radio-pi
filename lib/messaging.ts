import { IncomingMessage } from "http"
import { each } from "lodash"
import * as WebSocket from "ws"

import {
    MESSAGE_CLIENT_TYPE,
    CLIENT_TYPE,
    MESSAGE_TOKEN,
    MESSAGE_REQUEST_TOKEN,
    ISpotifyTokens,
    DOCUMENT_TOKENS,
    MESSAGE_UNAUTHORIZED
} from "../app/constants"

import { token } from "./spotify"
import { findOne, update } from "./database"

// General list of connected clients
const clients: WebSocket[] = []
// Clients that have identified as players
const players: WebSocket[] = []
// Clients that have identified as remotes
const remotes: WebSocket[] = []

let tokens: ISpotifyTokens | null

const onClientTypeMessage = (ws: WebSocket, message: any) => {
    if (message.payload === CLIENT_TYPE.PLAYER) {
        players.push(ws)
    } else if (message.payload === CLIENT_TYPE.REMOTE) {
        remotes.push(ws)

        if (tokens) {
            ws.send(
                JSON.stringify({
                    payload: tokens,
                    type: MESSAGE_TOKEN
                })
            )
        } else {
            ws.send(
                JSON.stringify({
                    type: MESSAGE_UNAUTHORIZED
                })
            )
        }
    }
}

const onRequestTokenMessage = async (ws: WebSocket, message: any) => {
    if (tokens) {
        const refreshed = await token(tokens.refresh_token, tokens.redirect_uri)
        tokens = {
            ...tokens,
            ...refreshed
        }
        await storeTokens(tokens)

        each(clients, (client) =>
            client.send(
                JSON.stringify({
                    payload: tokens,
                    type: MESSAGE_TOKEN
                })
            )
        )
    } else {
        each(clients, (client) => {
            client.send(
                JSON.stringify({
                    type: MESSAGE_UNAUTHORIZED
                })
            )
        })
    }
}

const onTokenMessage = async (ws: WebSocket, message: any) => {
    tokens = message.payload as ISpotifyTokens
    await storeTokens(tokens)
    each(clients, (client) => {
        client.send(JSON.stringify(message))
    })
}

async function storeTokens(tokens: ISpotifyTokens) {
    if (tokens.error) {
        return
    }

    return await update({ id: DOCUMENT_TOKENS }, { id: DOCUMENT_TOKENS, ...tokens }, { upsert: true })
}

async function handleMessage(ws: WebSocket, message: any) {
    switch (message.type) {
        case MESSAGE_CLIENT_TYPE:
            return onClientTypeMessage(ws, message)
        case MESSAGE_TOKEN:
            return onTokenMessage(ws, message)
        case MESSAGE_REQUEST_TOKEN:
            return onRequestTokenMessage(ws, message)
        default:
            console.log("unknown message type", message)
    }
}

export async function initialize() {
    tokens = await findOne<ISpotifyTokens>({ id: DOCUMENT_TOKENS })
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
            players.splice(players.indexOf(ws, 1))
        }

        if (remotes.indexOf(ws) > -1) {
            remotes.splice(remotes.indexOf(ws, 1))
        }
    })
}
