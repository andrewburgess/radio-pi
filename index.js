const { app, BrowserWindow } = require("electron")
const path = require("path")

let window

function createWindow() {
    window = new BrowserWindow({
        width: 1024,
        height: 768,
        webPreferences: {
            nodeIntegration: true,
            plugins: true
        }
    })

    window.loadFile("app/index.html")

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
