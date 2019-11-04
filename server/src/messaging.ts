import * as debug from "debug"
import { each } from "lodash"
import * as WebSocket from "ws"

import player from "./player"
import * as spotify from "./spotify"
import tokens from "./tokens"
import tuner from "./tuner"
import { ISpotifyTokens } from "./types"

export interface IMessage {
    payload: any
    type: Message
}

export enum Message {
    PLAYER_CONNECTED = "player:connected",
    PLAYER_DISCONNECTED = "player:disconnected",
    PLAYER_STATE_CHANGED = "player:state-changed",
    TOKENS_RECEIVED = "tokens:received",
    TOKENS_REQUEST = "tokens:request",
    TOKENS = "tokens",
    TOKENS_UNAUTHORIZED = "tokens:unauthorized",
    TUNER_UPDATE = "tuner:update"
}

const log = debug("radio-pi:messaging")

const clients: WebSocket[] = []

function sendMessage(ws: WebSocket, type: Message, payload?: any) {
    log(`sending message ${type} :: %O`, payload)
    ws.send(
        JSON.stringify({
            payload,
            type
        })
    )
}

const onPlayerDisconnected = (deviceId: any) => {
    each(clients, (client) => sendMessage(client, Message.PLAYER_DISCONNECTED, deviceId))
}

const onPlayerStateChanged = (state: any) => {
    each(clients, (client) => sendMessage(client, Message.PLAYER_STATE_CHANGED, state))
}

const onPlayerReady = (params: any) => {
    each(clients, (client) => sendMessage(client, Message.PLAYER_CONNECTED, params.device_id))
}

const onReceiveToken = async (ws: WebSocket, message: IMessage) => {
    tokens.setTokens(message.payload)

    const me = await spotify.getMe()
    tokens.setTokens({
        ...message.payload,
        username: me.id
    })
}

const onRequestToken = async (ws: WebSocket, message: IMessage) => {
    const t = tokens.getTokens()

    if (!t) {
        each(clients, (client) => sendMessage(client, Message.TOKENS_UNAUTHORIZED))
        return
    }

    each(clients, (client) => sendMessage(client, Message.TOKENS, t))
}

const onTokensChanged = (tokens: ISpotifyTokens) => {
    each(clients, (client) => sendMessage(client, Message.TOKENS, tokens))
}

const onTunerUpdate = (payload: any) => {
    each(clients, (client) => sendMessage(client, Message.TUNER_UPDATE, payload))
}

const MessageHandlers: { [key: string]: any } = {
    [Message.TOKENS_RECEIVED]: onReceiveToken,
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
    player.on("ready", onPlayerReady)
    player.on("state", onPlayerStateChanged)
    player.on("exit", onPlayerDisconnected)

    tokens.on("tokens", onTokensChanged)

    tuner.on("update", onTunerUpdate)
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

    const t = tokens.getTokens()
    if (!t) {
        each(clients, (client) => sendMessage(client, Message.TOKENS_UNAUTHORIZED))
        return
    }

    each(clients, (client) => sendMessage(client, Message.TOKENS, t))

    if (player.getDeviceId()) {
        onPlayerReady({ device_id: player.getDeviceId() })
    }

    if (player.getLastState()) {
        onPlayerStateChanged(player.getLastState())
    }

    onTunerUpdate(tuner.get())
}
