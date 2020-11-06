import { MESSAGE_TYPE, Message, PlayerInputMessage, GameStateMessage } from "shared"
import { observable } from "mobx"
import { Store } from "../Store"
import Base from "./Base"
import SocketIOClient from "socket.io-client"
import { getWsUrl } from "helpers"
import Swal from "sweetalert2"
import { each } from "lodash"

export enum SOCKET_STATE {
    CONNECTING = "CONNECTING",
    CONNECTED = "CONNECTED",
    NOT_CONNECTED = "NOT_CONNECTED",
    ERROR = "ERROR"
}

interface ListenerMap<M extends Message> {
    [key: string]: (inputMsg: M) => void
}

interface ListenersMap {
    [MESSAGE_TYPE.INPUT]: ListenerMap<PlayerInputMessage>
    [MESSAGE_TYPE.GAME_STATE]: ListenerMap<GameStateMessage>
}

export class SocketIOStore extends Base {
    static LISTENER_ID = 0

    @observable
    userId: string = ""

    @observable
    socketState = SOCKET_STATE.NOT_CONNECTED

    private _io?: SocketIOClient.Socket
    private _listeners: ListenersMap = {
        [MESSAGE_TYPE.INPUT]: {},
        [MESSAGE_TYPE.GAME_STATE]: {}
    }

    sendMsg = <M extends Message>(message: M) => {
        this.io().emit(message.type, message)
    }

    private static GetId() {
        return ++SocketIOStore.LISTENER_ID
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

                this.io().on(MESSAGE_TYPE.INPUT, (msg: PlayerInputMessage) => {
                    each(this._listeners[MESSAGE_TYPE.INPUT], fn => fn(msg))
                })
                this.io().on(MESSAGE_TYPE.GAME_STATE, (msg: GameStateMessage) => {
                    each(this._listeners[MESSAGE_TYPE.GAME_STATE], fn => fn(msg))
                })
            })
        })
    }

    addPlayerInputListener = (fn: (payload: PlayerInputMessage) => void): (() => void) => {
        const id = SocketIOStore.GetId()
        this._listeners[MESSAGE_TYPE.INPUT][id] = fn
        return () => {
            delete this._listeners[MESSAGE_TYPE.INPUT][id]
        }
    }

    addGameStateListener = (fn: (payload: GameStateMessage) => void): (() => void) => {
        const id = SocketIOStore.GetId()
        this._listeners[MESSAGE_TYPE.GAME_STATE][id] = fn
        return () => {
            delete this._listeners[MESSAGE_TYPE.GAME_STATE][id]
        }
    }
}
