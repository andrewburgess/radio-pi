const fs = require("fs")
const path = require("path")
const { promisify } = require("util")

const exists = promisify(fs.exists)
const mkdir = promisify(fs.mkdir)
const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)

const dataDirectory = path.join(process.cwd(), "data")
const dataFile = path.join(dataDirectory, "database.json")

const DOCUMENT_STATIONS = "STATIONS"
const DOCUMENT_TOKENS = "TOKENS"

let data = {}

module.exports.get = (key) => {
    return data[key]
}

module.exports.load = async () => {
    const dirExists = await exists(dataDirectory)
    if (!dirExists) {
        await mkdir(dataDirectory)
        await writeFile(dataFile, JSON.stringify({}))
    }

    data = await readFile(dataFile, "utf-8")
    data = JSON.parse(data)
}

module.exports.set = (key, value) => {
    data[key] = value

    fs.writeFileSync(dataFile, JSON.stringify(data))
}

module.exports.DOCUMENT_STATIONS = DOCUMENT_STATIONS
module.exports.DOCUMENT_TOKENS = DOCUMENT_TOKENS
