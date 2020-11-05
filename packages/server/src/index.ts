import express from "express"
import { toNumber } from "lodash"
import bodyParser from "body-parser"
import cors from "cors"
import { App } from "./App"
import { FormatDate } from "shared"

export function logger(request: express.Request, response: express.Response, next: () => void) {
    console.log(`${request.method} ${request.path} ${FormatDate(new Date())}`)
    next()
}

async function main() {
    const PORT = toNumber(process.env.PORT) || 5000
    const middlewaresBefore = [cors({ exposedHeaders: "Date" }), logger, bodyParser.urlencoded({ extended: true }), bodyParser.json()]

    const app = new App(PORT, middlewaresBefore, [])
    app.listen()
}

main()
