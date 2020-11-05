import { PlayerInput } from "./Game"

export enum MESSAGE_TYPE {
    IDENTIFICATION = "IDENTIFICATION",
    INPUT = "INPUT"
}

export interface Message {
    type: MESSAGE_TYPE
    ts?: number
}

export interface IdMessage extends Message {
    type: MESSAGE_TYPE.IDENTIFICATION
    payload: {
        id: string
    }
}

export interface PlayerInputMessage extends Message {
    type: MESSAGE_TYPE.INPUT
    payload: PlayerInput
}
