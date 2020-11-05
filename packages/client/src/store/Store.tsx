import Route from "./modules/Route"

export class Store {
    route: Route

    constructor() {
        this.route = new Route()
    }

    async init() {
        const promises = [this.route.init(this)]
        return Promise.all(promises)
    }
}

export default new Store()
