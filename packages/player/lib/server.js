const bodyParser = require("body-parser")
const cors = require("cors")
const express = require("express")
const http = require("http")
const path = require("path")
const WebSocket = require("ws")

const { DOCUMENT_STATIONS, RADIO_BAND, SPOTIFY_STATION_TYPE } = require("@radio-pi/common")

const { initialize, onConnection } = require("./messaging")
const { token } = require("./spotify")
const database = require("./database")

const app = express()
app.use(cors())
app.use(bodyParser.json())

app.use(express.static(path.join(__dirname, "../dist")))

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

app.get("/api/stations", async (req, res) => {
    const document = database.get(DOCUMENT_STATIONS)

    if (!document) {
        database.set(DOCUMENT_STATIONS, [
            {
                band: RADIO_BAND.FM,
                frequency: 92.5,
                spotifyItem: 1,
                type: SPOTIFY_STATION_TYPE.PLAYLIST
            }
        ])
        return res.json(database.get(DOCUMENT_STATIONS))
    } else {
        return res.json(document)
    }
})

const server = http.createServer(app)
const socket = new WebSocket.Server({ server, path: "/ws" })

socket.on("connection", onConnection)

module.exports = async () => {
    await initialize()

    return server.listen(3001, () => {
        console.log("server listening on 3001")
    })
}
