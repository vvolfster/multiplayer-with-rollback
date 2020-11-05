import { globalHistory, HistoryListenerParameter, HistoryLocation } from "@reach/router"
import { getQueryParams, Params } from "helpers/getQueryParams"
import { action, computed, observable } from "mobx"
import { Store } from "../Store"
import Base from "./Base"

interface RouteState {
    location: HistoryLocation
    prevLocation: HistoryLocation | undefined
}

export default class Route extends Base {
    @observable state: RouteState = {
        location: globalHistory.location,
        prevLocation: undefined
    }

    init = async (store: Store) => {
        await super.init(store)
        globalHistory.listen(this.onHistoryChange)

        return Promise.resolve()
    }

    @action
    onHistoryChange = (listener: HistoryListenerParameter) => {
        this.state.prevLocation = this.state.location
        this.state.location = listener.location
    }

    @computed get queryParams(): Params {
        return getQueryParams(this.state.location.search)
    }
}
