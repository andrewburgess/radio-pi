require("dotenv").config()

import { app, BrowserWindow } from "electron"
import { Server } from "http"

import startServer from "./lib/server"

try {
    require("electron-reloader")(module)
} catch (err) {}

let window: BrowserWindow | null
let server: Server

function createWindow() {
    window = new BrowserWindow({
        height: 768,
        webPreferences: {
            nodeIntegration: true,
            plugins: true
        },
        width: 1024
    })

    window.loadURL("http://localhost:3000")
    window.on("closed", () => {
        window = null
    })
}

app.on("activate", () => {
    if (window === null) {
        createWindow()
    }
})

app.on("ready", () => {
    createWindow()

    server = startServer()
})

app.on("will-quit", () => {
    if (server) {
        server.close()
    }
})

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit()
    }
})
