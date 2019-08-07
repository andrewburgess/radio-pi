const bodyParser = require("body-parser")
const cors = require("cors")
const express = require("express")
const http = require("http")
const path = require("path")
const WebSocket = require("ws")

const { DOCUMENT_STATIONS, RADIO_BAND, SPOTIFY_STATION_TYPE } = require("@revolt-radio/common")

const { initialize, onConnection } = require("./messaging")
const { token } = require("./spotify")
const { findOne, update } = require("./database")

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
    const document = await findOne({ id: DOCUMENT_STATIONS })

    if (!document) {
        await update(
            { id: DOCUMENT_STATIONS },
            {
                id: DOCUMENT_STATIONS,
                stations: [
                    {
                        band: RADIO_BAND.FM,
                        frequency: 92.5,
                        spotifyItem: 1,
                        type: SPOTIFY_STATION_TYPE.PLAYLIST
                    }
                ]
            },
            { upsert: true }
        )
        return res.json([])
    } else {
        return res.json(document.stations)
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
