require("dotenv").config()

import { app, BrowserWindow } from "electron"
import * as isDev from "electron-is-dev"
import { Server } from "http"

import startServer from "./lib/server"

try {
    require("electron-reloader")(module)
} catch (err) {}

let player: BrowserWindow | null
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
        if (player) {
            player.close()
        }
        window = null
    })
}

function createPlayerWindow() {
    let options: Electron.BrowserWindowConstructorOptions = {
        focusable: false,
        frame: false,
        height: 1,
        opacity: 0,
        skipTaskbar: true,
        transparent: true,
        webPreferences: {
            backgroundThrottling: false,
            nodeIntegration: true
        },
        width: 1
    }

    if (isDev) {
        options = Object.assign({}, options, {
            focusable: true,
            frame: true,
            height: 400,
            opacity: 1,
            skipTaskbar: false,
            transparent: false,
            width: 400
        })
    }

    player = new BrowserWindow(options)

    player.loadURL("http://localhost:3000/player.html")
    player.on("closed", () => {
        player = null
    })
    player.on("show", () => {
        if (player) {
            player.minimize()
        }
    })
    player.webContents.on("new-window", (event, url, frameName, disposition, options, additionalFeatures) => {
        event.preventDefault()
        Object.assign(options, {
            focusable: true,
            frame: true,
            height: 600,
            modal: true,
            opacity: 1,
            parent: player,
            show: true,
            skipTaskbar: false,
            transparent: false,
            width: 800
        })
        const newWindow = new BrowserWindow(options)
        newWindow.loadURL(url)
    })
}

app.on("activate", () => {
    if (window === null) {
        createWindow()
    }

    if (player === null) {
        createPlayerWindow()
    }
})

app.on("ready", () => {
    createWindow()
    createPlayerWindow()

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
