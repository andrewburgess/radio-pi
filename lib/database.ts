import * as Datastore from "nedb"
import * as path from "path"
import { promisify } from "util"

const database = new Datastore({
    autoload: true,
    filename: path.join(process.cwd(), "data", "database.db")
})

export default database

export const findOne = promisify(database.findOne.bind(database)) as <T>(query: any) => Promise<T>
export const update = promisify(database.update.bind(database)) as <T>(
    query: any,
    updateQuery: T,
    options?: Nedb.UpdateOptions | undefined
) => Promise<{ numberOfUpdated: number; upsert: boolean }>
