import { nanoid } from "nanoid"
import { TopDownEngine } from "game-engine"
import { MESSAGE_TYPE, IdMessage, PlayerInputMessage, RequestGameStartMessage, GameStateMessage, Message } from "shared"
import socketIo from "socket.io"
import http from "http"

export class SocketIORouter {
    io: socketIo.Server
    socketMap = new Map<string, socketIo.Socket>()
    startTime = 0
    engine: TopDownEngine

    private broadcast = <M extends Message>(message: M, excludeIds: string[] = []) => {
        this.socketMap.forEach((socket, id) => {
            if (excludeIds.includes(id)) {
                return
            }
            socket.emit(message.type, message)
        })
    }

    private send = <M extends Message>(socket: socketIo.Socket, message: M) => {
        socket.emit(message.type, message)
    }

    constructor(server: http.Server) {
        this.io = socketIo(server)
        this.engine = new TopDownEngine("", 100)

        this.io.on("connection", socket => {
            console.log("a socket connected")
            let socketId: string

            socket.on(MESSAGE_TYPE.IDENTIFICATION, (message: IdMessage) => {
                try {
                    socketId = message.payload.id
                    this.socketMap.set(message.payload.id, socket)
                    console.log("user logged in", message.payload.id)
                } catch (e) {
                    console.error(`Error parsing ${MESSAGE_TYPE.IDENTIFICATION}`, JSON.stringify(message, null, 4))
                }
            })
            socket.on(MESSAGE_TYPE.INPUT, (message: PlayerInputMessage) => {
                if (!socketId) {
                    return
                }

                // broadcast this to every other socket
                this.broadcast(message, [socketId])

                // update local state
                this.engine.engine.setInput(message.payload.input, message.payload.stateId)
            })
            socket.on(MESSAGE_TYPE.REQUEST_GAME_START, (message: RequestGameStartMessage) => {
                // tell everyone new game
                try {
                    if (message.payload.restartGame || !this.startTime) {
                        this.engine.engine.stopGameLoop()

                        const gameId = nanoid(10)
                        this.engine = new TopDownEngine(gameId, 100)

                        this.startTime = new Date().getTime()
                        this.engine.engine.startGameLoop(10, this.startTime)
                        const message: GameStateMessage = {
                            type: MESSAGE_TYPE.GAME_STATE,
                            payload: {
                                gameId,
                                startTime: this.engine.engine.startTime,
                                gameTime: this.engine.engine.currentState().time,
                                states: this.engine.engine.allStates()
                            }
                        }
                        this.broadcast(message)
                    } else {
                        const message: GameStateMessage = {
                            type: MESSAGE_TYPE.GAME_STATE,
                            payload: {
                                gameId: this.engine.engine.gameId(),
                                startTime: this.engine.engine.startTime,
                                gameTime: this.engine.engine.currentState().time,
                                states: this.engine.engine.allStates()
                            }
                        }
                        this.send(socket, message)
                    }
                } catch (e) {
                    console.error(`Error parsing ${MESSAGE_TYPE.REQUEST_GAME_START}`, JSON.stringify(message, null, 4))
                }
            })
        })

        console.log("SocketIO Router ready")
    }
}
