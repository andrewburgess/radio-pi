const Datastore = require("nedb")
const path = require("path")
const { promisify } = require("util")

const database = new Datastore({
    autoload: true,
    filename: path.join(process.cwd(), "data", "database.db")
})

module.exports = database

module.exports.findOne = promisify(database.findOne.bind(database))
module.exports.update = promisify(database.update.bind(database))
