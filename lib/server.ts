import * as bodyParser from "body-parser"
import * as cors from "cors"
import * as express from "express"
import * as http from "http"
import * as WebSocket from "ws"

import { DOCUMENT_STATIONS, IStationsDocument, RADIO_BAND, SPOTIFY_STATION_TYPE } from "../app/constants"
import { initialize, onConnection } from "./messaging"
import { token } from "./spotify"
import { findOne, update } from "./database"

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

app.get("/api/stations", async (req, res) => {
    const document = await findOne<IStationsDocument | null>({ id: DOCUMENT_STATIONS })

    if (!document) {
        await update<IStationsDocument>(
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
const socket = new WebSocket.Server({ server })

socket.on("connection", onConnection)

export default async () => {
    await initialize()
    return server.listen(3001, () => {
        console.log("server listening on 3001")
    })
}
