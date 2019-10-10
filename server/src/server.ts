import * as bodyParser from "body-parser"
import * as cors from "cors"
import * as debug from "debug"
import * as express from "express"
import { createServer } from "http"
import * as path from "path"
import * as WebSocket from "ws"

import * as database from "./database"
import router from "./routes"
import { onConnection, initialize } from "./messaging"

const log = debug("radio-pi:server")

const app = express()
app.use(cors())
app.use(bodyParser.json())

log("TODO: Determine static file directory")
app.use(express.static(path.join(__dirname, "../dist")))

app.use(router)

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    return res.status(500).json({
        error: true,
        message: err.message,
        status: 500
    })
})

const server = createServer(app)
const socket = new WebSocket.Server({ server, path: "/ws" })

socket.on("connection", onConnection)

export default async function start() {
    await database.load()
    await initialize()

    return server.listen(3001, () => {
        console.log("server listening on 3001")
    })
}