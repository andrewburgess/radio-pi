import { configure } from "@storybook/react"
const req = require.context("../src/stories", true, /\.js$/)

function loadStories() {
    req.keys().forEach(req)
}

configure(loadStories, module)
