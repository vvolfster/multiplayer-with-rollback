import { LocalStorageStore } from "./modules/LocalStorage"
import { RouteStore } from "./modules/Route"
import { SocketIOStore } from "./modules/SocketIO"

export class Store {
    route: RouteStore
    socketIO: SocketIOStore
    localStorage: LocalStorageStore

    constructor() {
        this.route = new RouteStore()
        this.socketIO = new SocketIOStore()
        this.localStorage = new LocalStorageStore()
    }

    async init() {
        const promises = [this.route.init(this), this.socketIO.init(this), this.localStorage.init(this)]
        return Promise.all(promises)
    }
}

export default new Store()
