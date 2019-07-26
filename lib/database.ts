import * as Datastore from "nedb"
import * as path from "path"

const database = new Datastore({
    autoload: true,
    filename: path.join(process.cwd(), "data", "database.db")
})

export default database
