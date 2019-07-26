import * as React from "react"
import * as ReactDOM from "react-dom"

import { SocketProvider } from "./context/socket"
import App from "./App"

ReactDOM.render(
    <SocketProvider>
        <App />
    </SocketProvider>,
    document.getElementById("root")
)
