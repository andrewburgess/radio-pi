const { each } = require("lodash")
const log = require("debug")("radio-pi:messaging")

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
} = require("@radio-pi/common")

const { refresh } = require("./spotify")
const database = require("./database")

// General list of connected clients
const clients = []
// Clients that have identified as players
const players = []
// Clients that have identified as remotes
const remotes = []

let lastState = null
let tokens = null

function sendMessage(ws, type, payload) {
    log(`sending message ${type} :: %O`, payload)
    ws.send(
        JSON.stringify({
            payload,
            type
        })
    )
}

/**
 * Checks to see if the current set of tokens are expired. They are if they are
 * null, or if the createdAt + expires_in is in at least 5 minutes
 */
function tokensAreExpired() {
    const now = Date.now()
    return !tokens || now - (tokens.createdAt + tokens.expires_in * 1000) >= 5 * 60 * 1000 * -1
}

async function refreshTokens() {
    log(`refreshing tokens`)

    const refreshed = await refresh(tokens.refresh_token)

    if (refreshed.error) {
        console.error(`failed to refresh tokens: ${refreshed.error_message}`)
        each(clients, (client) => sendMessage(client, MESSAGE_UNAUTHORIZED))

        return false
    }

    tokens = {
        ...tokens,
        ...refreshed,
        createdAt: Date.now()
    }
    await storeTokens(tokens)

    log(`tokens refreshed`)

    return true
}

const onClientTypeMessage = async (ws, message) => {
    if (message.payload === CLIENT_TYPE.PLAYER) {
        players.push(ws)
    } else if (message.payload === CLIENT_TYPE.REMOTE) {
        remotes.push(ws)

        if (tokensAreExpired()) {
            await refreshTokens()
        }

        if (!tokensAreExpired()) {
            sendMessage(ws, MESSAGE_TOKEN, tokens)

            setTimeout(() => {
                each(players, (player) => {
                    if (player.deviceId) {
                        sendMessage(ws, MESSAGE_PLAYER_CONNECTED, player.deviceId)
                    }
                })

                if (lastState) {
                    sendMessage(ws, MESSAGE_PLAYER_STATE_CHANGED, lastState)
                }
            }, 1000)
        } else {
            sendMessage(ws, MESSAGE_UNAUTHORIZED)
        }
    }
}

const onPlayerConnectedMessage = (ws, message) => {
    ws.deviceId = message.payload

    each(remotes, (remote) => sendMessage(remote, MESSAGE_PLAYER_CONNECTED, message.payload))
}

const onPlayerStateChanged = (ws, message) => {
    lastState = message.payload
    each(remotes, (remote) => sendMessage(remote, MESSAGE_PLAYER_STATE_CHANGED, message.payload))
}

const onRequestTokenMessage = async (ws, message) => {
    if (tokens) {
        if (tokensAreExpired()) {
            await refreshTokens()
        }

        each(clients, (client) => sendMessage(client, MESSAGE_TOKEN, tokens))
    } else {
        each(clients, (client) => sendMessage(client, MESSAGE_UNAUTHORIZED))
    }
}

const onTokenMessage = async (ws, message) => {
    tokens = message.payload
    await storeTokens(tokens)
    each(clients, (client) => sendMessage(client, message.type, message.payload))
}

async function storeTokens(tokens) {
    if (tokens.error) {
        return
    }

    database.set(DOCUMENT_TOKENS, {
        ...tokens,
        createdAt: new Date().getTime()
    })
}

async function handleMessage(ws, message) {
    if (MessageHandlers[message.type]) {
        log(`received message ${message.type} :: %O`, message.payload)
        return MessageHandlers[message.type](ws, message)
    }

    console.log("unknown message type", message)
}

module.exports.initialize = async () => {
    tokens = database.get(DOCUMENT_TOKENS)
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
            log(`player disconnected`)
            players.splice(players.indexOf(ws, 1))
            if (ws.deviceId) {
                each(remotes, (remote) => sendMessage(remote, MESSAGE_PLAYER_DISCONNECTED, ws.deviceId))
            }
        }

        if (remotes.indexOf(ws) > -1) {
            log(`client disconnected`)
            remotes.splice(remotes.indexOf(ws, 1))
        }
    })
}

const MessageHandlers = {
    [MESSAGE_CLIENT_TYPE]: onClientTypeMessage,
    [MESSAGE_PLAYER_CONNECTED]: onPlayerConnectedMessage,
    [MESSAGE_PLAYER_STATE_CHANGED]: onPlayerStateChanged,
    [MESSAGE_REQUEST_TOKEN]: onRequestTokenMessage,
    [MESSAGE_TOKEN]: onTokenMessage
}
