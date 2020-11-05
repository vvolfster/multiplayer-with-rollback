import express from "express"
import http from "http"
import * as path from "path"
import * as mimes from "./services/mimes"
import { SocketIORouter } from "./routers/SocketIORouter"

export type MiddleWareFn = (req: express.Request, res: express.Response, next: () => void) => void

export class App {
    static Server?: http.Server
    static SocketIoRouter?: SocketIORouter
    app: express.Application
    port: number

    constructor(port: number, middlewareBefore: MiddleWareFn[], middlewareAfter: MiddleWareFn[]) {
        this.app = express()
        this.port = port

        /* the stuff that should happen before a request is handled by the routers */
        middlewareBefore.forEach(middleware => this.app.use(middleware))

        /* all the typesafe routers that do the actual work. A request will fall into one of these only */

        /* all stuff that needs to happen after a request is handled by the router.
         At this point, the only thing we do is make sure that the router errors are
          correctly sent back with the right code and message */
        middlewareAfter.forEach(middleware => this.app.use(middleware))

        /* serve static files */
        express.static.mime.define(mimes.typeMap)
        this.app.use(express.static(path.resolve(__dirname, "./buildSite")))
        this.app.get("*", (req, res) => {
            res.sendFile(path.resolve(__dirname, "./buildSite/index.html"))
        })
    }

    listen = () => {
        App.Server = http.createServer(this.app)
        App.Server.setTimeout(60000)
        App.Server.listen(this.port, () => console.log(`server listening at port: ${this.port}`))
        App.SocketIoRouter = new SocketIORouter(App.Server)
    }
}
