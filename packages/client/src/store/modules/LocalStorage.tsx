import { observable } from "mobx"
import Base from "./Base"

export enum LOCAL_STORAGE_KEYS {
    USER_NAME = "USER_NAME"
}

export class LocalStorageStore extends Base {
    @observable
    username = localStorage.getItem(LOCAL_STORAGE_KEYS.USER_NAME) || undefined

    set = {
        username: (value?: string) => {
            if (value) {
                localStorage.setItem(LOCAL_STORAGE_KEYS.USER_NAME, value)
                this.username = value
            } else {
                localStorage.removeItem(LOCAL_STORAGE_KEYS.USER_NAME)
                this.username = undefined
            }
        }
    }
}
