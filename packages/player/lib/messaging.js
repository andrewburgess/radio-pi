const { each } = require("lodash")

const {
    CLIENT_TYPE,
    DOCUMENT_TOKENS,
    MESSAGE_CLIENT_TYPE,
    MESSAGE_PLAYER_CONNECTED,
    MESSAGE_PLAYER_DISCONNECTED,
    MESSAGE_PLAYER_STATE_CHANGED,
    MESSAGE_REQUEST_TOKEN,
    MESSAGE_TOKEN,
    MESSAGE_UNAUTHORIZED
} = require("@revolt-radio/common")

const { token } = require("./spotify")
const { findOne, update } = require("./database")

const MessageHandlers = {
    [MESSAGE_CLIENT_TYPE]: onClientTypeMessage,
    [MESSAGE_PLAYER_CONNECTED]: onPlayerConnectedMessage,
    [MESSAGE_PLAYER_STATE_CHANGED]: onPlayerStateChanged,
    [MESSAGE_REQUEST_TOKEN]: onRequestTokenMessage,
    [MESSAGE_TOKEN]: onTokenMessage
}

// General list of connected clients
const clients = []
// Clients that have identified as players
const players = []
// Clients that have identified as remotes
const remotes = []

let lastState = null
let tokens = null

const onClientTypeMessage = (ws, message) => {
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

            setTimeout(() => {
                each(players, (player) => {
                    if (player.deviceId) {
                        ws.send(
                            JSON.stringify({
                                type: MESSAGE_PLAYER_CONNECTED,
                                payload: player.deviceId
                            })
                        )
                    }
                })

                if (lastState) {
                    ws.send(
                        JSON.stringify({
                            type: MESSAGE_PLAYER_STATE_CHANGED,
                            payload: lastState
                        })
                    )
                }
            }, 1000)
        } else {
            ws.send(
                JSON.stringify({
                    type: MESSAGE_UNAUTHORIZED
                })
            )
        }
    }
}

const onPlayerConnectedMessage = (ws, message) => {
    ws.deviceId = message.payload

    each(remotes, (remote) =>
        remote.send(
            JSON.stringify({
                type: MESSAGE_PLAYER_CONNECTED,
                payload: message.payload
            })
        )
    )
}

const onPlayerStateChanged = (ws, message) => {
    lastState = message.payload
    each(remotes, (remote) =>
        remote.send(
            JSON.stringify({
                type: MESSAGE_PLAYER_STATE_CHANGED,
                payload: message.payload
            })
        )
    )
}

const onRequestTokenMessage = async (ws, message) => {
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

const onTokenMessage = async (ws, message) => {
    tokens = message.payload
    await storeTokens(tokens)
    each(clients, (client) => {
        client.send(JSON.stringify(message))
    })
}

async function storeTokens(tokens) {
    if (tokens.error) {
        return
    }

    return await update({ id: DOCUMENT_TOKENS }, { id: DOCUMENT_TOKENS, ...tokens }, { upsert: true })
}

async function handleMessage(ws, message) {
    if (MessageHandlers[message.type]) {
        return MessageHandlers[message.type](ws, message)
    }

            console.log("unknown message type", message)
    }

module.exports.initialize = async () => {
    tokens = await findOne({ id: DOCUMENT_TOKENS })
}

module.exports.onConnection = (ws) => {
    clients.push(ws)

    ws.on("message", (data) => {
        if (typeof data === "string") {
            handleMessage(ws, JSON.parse(data))
        }
    })

    ws.on("close", () => {
        clients.splice(clients.indexOf(ws, 1))

        if (players.indexOf(ws) > -1) {
            players.splice(players.indexOf(ws, 1))
            if (ws.deviceId) {
                each(remotes, (remote) =>
                    remote.send(
                        JSON.stringify({
                            type: MESSAGE_PLAYER_DISCONNECTED,
                            payload: ws.deviceId
                        })
                    )
                )
            }
        }

        if (remotes.indexOf(ws) > -1) {
            remotes.splice(remotes.indexOf(ws, 1))
        }
    })
}
