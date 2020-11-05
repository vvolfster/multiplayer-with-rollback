import { Store } from "../Store"

export default class Base {
    store?: Store = undefined

    async init(store: Store) {
        // override this method to do stuff on store creation
        this.store = store
        return Promise.resolve()
    }
}
