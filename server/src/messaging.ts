import * as debug from "debug"
import { each } from "lodash"
import * as WebSocket from "ws"

import * as database from "./database"
import player from "./player"
import { ISpotifyTokens, Key } from "./database"
import { refresh } from "./spotify"

export interface IMessage {
    payload: any
    type: Message
}

export enum Message {
    PLAYER_CONNECTED = "player:connected",
    PLAYER_DISCONNECTED = "player:disconnected",
    PLAYER_STATE_CHANGED = "player:state-changed",
    TOKENS = "tokens",
    TOKENS_REQUEST = "tokens:request",
    TOKENS_UNAUTHORIZED = "tokens:unauthorized"
}

const log = debug("radio-pi:messaging")

const clients: WebSocket[] = []

function tokensAreExpired(tokens: ISpotifyTokens) {
    const now = Date.now()
    return !tokens || now - (tokens.created_at + tokens.expires_in * 1000) >= 5 * 60 * 1000 * -1
}

async function refreshTokens(tokens: ISpotifyTokens) {
    log("refreshing tokens")

    if (!tokens.refresh_token) {
        return tokens
    }

    const refreshed = await refresh(tokens.refresh_token)

    if (refreshed.error) {
        console.error(`failed to refresh tokens: ${refreshed.error_message}`)
        each(clients, (client) => sendMessage(client, Message.TOKENS_UNAUTHORIZED))

        return tokens
    }

    let newTokens = {
        ...tokens,
        ...refreshed,
        created_at: Date.now()
    }

    database.set(Key.TOKENS, newTokens)

    return newTokens
}

function sendMessage(ws: WebSocket, type: Message, payload?: any) {
    log(`sending message ${type} :: %O`, payload)
    ws.send(
        JSON.stringify({
            payload,
            type
        })
    )
}

const onPlayerDisconnected = () => {
    each(clients, (client) => sendMessage(client, Message.PLAYER_DISCONNECTED))
}

const onPlayerReady = (params: any) => {
    each(clients, (client) => sendMessage(client, Message.PLAYER_CONNECTED, params.device_id))
}

const onRequestToken = async (ws: WebSocket, message: IMessage) => {
    const tokens = database.get(Key.TOKENS)
    if (tokensAreExpired(tokens)) {
        await refreshTokens(tokens)
    }
}

const onTokensChanged = (ws: WebSocket, message: IMessage) => {
    database.set(Key.TOKENS, { ...message.payload, created_at: Date.now() })
    each(clients, (client) => sendMessage(client, message.type, message.payload))
}

const MessageHandlers: { [key: string]: any } = {
    [Message.TOKENS]: onTokensChanged,
    [Message.TOKENS_REQUEST]: onRequestToken
}

async function handleMessage(ws: WebSocket, message: IMessage) {
    if (message.type in MessageHandlers) {
        log(`received message ${message.type} :: %O`, message.payload)
        return MessageHandlers[message.type](ws, message)
    }

    console.log("unknown message type", message)
    return false
}

export async function initialize() {
    await initializeTokens()

    player.on("ready", onPlayerReady)
    player.on("exit", onPlayerDisconnected)
}

async function initializeTokens() {
    let tokens = database.get(Key.TOKENS)

    if (tokensAreExpired(tokens)) {
        tokens = await refreshTokens(tokens)
    }

    if (tokensAreExpired(tokens)) {
        each(clients, (client) => sendMessage(client, Message.TOKENS_UNAUTHORIZED))
    } else {
        each(clients, (client) => sendMessage(client, Message.TOKENS, tokens))
    }
}

export async function onConnection(ws: WebSocket) {
    clients.push(ws)

    ws.on("message", (data) => {
        if (typeof data === "string") {
            handleMessage(ws, JSON.parse(data))
        }
    })

    ws.on("close", () => {
        clients.splice(clients.indexOf(ws, 1))
    })

    await initializeTokens()

    if (player.getDeviceId()) {
        onPlayerReady({ device_id: player.getDeviceId() })
    }
}
