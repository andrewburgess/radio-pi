import * as bodyParser from "body-parser"
import * as cors from "cors"
import * as express from "express"
import * as http from "http"
import * as WebSocket from "ws"

import { initialize, onConnection } from "./messaging"
import { token } from "./spotify"

const app = express()
app.use(cors())
app.use(bodyParser.json())

app.post("/api/spotify/token", async (req, res) => {
    const { code, redirect_uri } = req.body

    const tokens = await token(code, redirect_uri)

    res.json(tokens)
})

app.post("/api/spotify/refresh", (req, res) => {
    res.json({
        message: "refresh"
    })
})

const server = http.createServer(app)
const socket = new WebSocket.Server({ server })

socket.on("connection", onConnection)

export default async () => {
    await initialize()
    return server.listen(3001, () => {
        console.log("server listening on 3001")
    })
}
