const bodyParser = require("body-parser")
const cors = require("cors")
const express = require("express")
const http = require("http")
const path = require("path")
const WebSocket = require("ws")

const { initialize, onConnection } = require("./messaging")
const { token } = require("./spotify")
const database = require("./database")
const { RADIO_BAND, SPOTIFY_STATION_TYPE } = require("../../client/src/constants")

const app = express()
app.use(cors())
app.use(bodyParser.json())

app.use(express.static(path.join(__dirname, "../dist")))

app.get("/api/spotify/url", (req, res) => {
    const authorizeUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${
        process.env.SPOTIFY_CLIENT_ID
    }&scope=${encodeURIComponent(
        `streaming user-modify-playback-state user-read-birthdate user-read-email user-read-private`
    )}&redirect_uri=${req.query.redirect_uri}`

    res.json({
        url: authorizeUrl
    })
})

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
    const document = database.get(database.DOCUMENT_STATIONS)

    if (!document) {
        database.set(database.DOCUMENT_STATIONS, [
            {
                band: RADIO_BAND.FM,
                frequency: 92.5,
                spotifyItem: 1,
                type: SPOTIFY_STATION_TYPE.PLAYLIST
            }
        ])
        return res.json(database.get(database.DOCUMENT_STATIONS))
    } else {
        return res.json(document)
    }
})

const server = http.createServer(app)
const socket = new WebSocket.Server({ server, path: "/ws" })

socket.on("connection", onConnection)

module.exports = async () => {
    await database.load()
    await initialize()

    return server.listen(3001, () => {
        console.log("server listening on 3001")
    })
}
