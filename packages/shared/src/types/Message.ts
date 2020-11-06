import { GameState, PlayerInput } from "./Game"

export enum MESSAGE_TYPE {
    IDENTIFICATION = "IDENTIFICATION",
    INPUT = "INPUT",
    GAME_START = "GAME_START",
    REQUEST_GAME_START = "REQUEST_GAME_START"
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
    payload: {
        input: PlayerInput
        stateId: number
    }
}

export interface GameStartMessage extends Message {
    type: MESSAGE_TYPE.GAME_START
    payload: {
        startTime: number
        gameTime: number
        states: GameState[]
    }
}

export interface RequestGameStartMessage extends Message {
    type: MESSAGE_TYPE.REQUEST_GAME_START
    payload: {
        restartGame: boolean
    }
}
