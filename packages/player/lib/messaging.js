const { each } = require("lodash")

const {
    MESSAGE_CLIENT_TYPE,
    CLIENT_TYPE,
    MESSAGE_TOKEN,
    MESSAGE_REQUEST_TOKEN,
    DOCUMENT_TOKENS,
    MESSAGE_UNAUTHORIZED
} = require("@revolt-radio/common")

const { token } = require("./spotify")
const { findOne, update } = require("./database")

// General list of connected clients
const clients = []
// Clients that have identified as players
const players = []
// Clients that have identified as remotes
const remotes = []

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
        } else {
            ws.send(
                JSON.stringify({
                    type: MESSAGE_UNAUTHORIZED
                })
            )
        }
    }
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
        }

        if (remotes.indexOf(ws) > -1) {
            remotes.splice(remotes.indexOf(ws, 1))
        }
    })
}
