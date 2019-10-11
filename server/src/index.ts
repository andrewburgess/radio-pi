import * as dotenv from "dotenv"

import start from "./server"

dotenv.config()

if (!process.env.SPOTIFY_CLIENT_ID) {
    throw new Error("SPOTIFY_CLIENT_ID not defined")
}

if (!process.env.SPOTIFY_CLIENT_SECRET) {
    throw new Error("SPOTIFY_CLIENT_SECRET not defined")
}

start()
