const { app, BrowserWindow } = require("electron")
const isDev = require("electron-is-dev")
const path = require("path")

let window

function createWindow() {
    window = new BrowserWindow({
        height: 768,
        width: 1024,
        webPreferences: {
            nodeIntegration: true,
            plugins: true
        }
    })

    window.loadURL(isDev ? "http://localhost:3000" : `file://${path.join(__dirname, "build/index.html")}`)

    window.on("closed", () => {
        window = null
    })
}

app.on("ready", createWindow)
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit()
    }
})
app.on("activate", () => {
    if (window === null) {
        createWindow()
    }
})
