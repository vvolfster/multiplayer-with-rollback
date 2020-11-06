import { MESSAGE_TYPE, IdMessage, Message } from "shared"
import { observable } from "mobx"
import { Store } from "../Store"
import Base from "./Base"
import SocketIOClient from "socket.io-client"
import { getServerPort, getServerUrl, getWsUrl } from "helpers"
import Swal from "sweetalert2"

export enum SOCKET_STATE {
    CONNECTING = "CONNECTING",
    CONNECTED = "CONNECTED",
    NOT_CONNECTED = "NOT_CONNECTED",
    ERROR = "ERROR"
}

export class SocketIOStore extends Base {
    @observable
    userId: string = ""

    @observable
    socketState = SOCKET_STATE.NOT_CONNECTED

    private _io?: SocketIOClient.Socket

    sendMsg = <M extends Message>(message: M) => {
        this.io().emit(message.type, message)
    }

    private io() {
        if (!this._io) {
            throw new Error("Called io before init")
        }
        return this._io
    }

    setUserId = async (callback?: () => void) => {
        const { store } = this
        if (!store) {
            throw new Error("Called setUserId before init")
        }

        await Swal.fire({
            title: "Hello stranger",
            text: "Tell me your name",
            icon: "info",
            confirmButtonText: "Confirm",
            input: "text",
            allowEscapeKey: false,
            allowOutsideClick: false,
            inputValue: store.localStorage.username,
            preConfirm: async (inputValue: string) => {
                this.sendMsg({
                    type: MESSAGE_TYPE.IDENTIFICATION,
                    payload: {
                        id: inputValue
                    }
                })
                store.localStorage.set.username(inputValue)
                this.userId = inputValue
                if (callback) {
                    callback()
                }
            }
        })

        await Swal.fire(`Welcome ${store.localStorage.username}!`)
    }

    init = async (store: Store) => {
        super.init(store)
        this._io = SocketIOClient(getWsUrl())
        this.socketState = SOCKET_STATE.CONNECTING

        return new Promise<void>((resolve, reject) => {
            this.io().on("connect", async () => {
                this.socketState = SOCKET_STATE.CONNECTED
                this.setUserId(resolve)
            })
        })
    }
}
