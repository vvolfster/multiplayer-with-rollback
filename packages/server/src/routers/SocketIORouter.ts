import { MESSAGE_TYPE, IdMessage, PlayerInputMessage, Message } from "shared"
import socketIo from "socket.io"
import http from "http"

export class SocketIORouter {
    io: socketIo.Server
    socketMap = new Map<string, socketIo.Socket>()

    private broadcast = <M extends Message>(message: M, excludeIds: string[] = []) => {
        this.socketMap.forEach((socket, id) => {
            if (excludeIds.includes(id)) {
                return
            }
            socket.emit(message.type, message)
        })
    }

    constructor(server: http.Server) {
        this.io = socketIo(server)

        this.io.on("connection", socket => {
            console.log("a socket connected")
            let socketId: string

            socket.on(MESSAGE_TYPE.IDENTIFICATION, (message: IdMessage) => {
                console.log("message received", message)
                socketId = message.payload.id
                this.socketMap.set(message.payload.id, socket)
            })
            socket.on(MESSAGE_TYPE.INPUT, (message: PlayerInputMessage) => {
                if (!socketId) {
                    return
                }

                // broadcast this to every other socket
                this.broadcast(message, [socketId])
            })
        })

        console.log("SocketIO Router ready")
    }
}
