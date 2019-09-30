require("dotenv").config()

const { app, BrowserWindow } = require("electron")
const isDev = require("electron-is-dev")

const startServer = require("./lib/server")

try {
    require("electron-reloader")(module)
} catch (err) {}

let player
let server

function createPlayerWindow() {
    let options = {
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

    player.loadURL("http://localhost:3001/index.html")
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
    if (player === null) {
        createPlayerWindow()
    }
})

app.on("ready", async () => {
    createPlayerWindow()

    server = await startServer()
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