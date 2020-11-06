import { GameState, PlayerInput } from "./Game"

export enum MESSAGE_TYPE {
    IDENTIFICATION = "IDENTIFICATION",
    INPUT = "INPUT",
    GAME_STATE = "GAME_START",
    REQUEST_GAME_START = "REQUEST_GAME_START",
    REQUEST_GAME_STATE = "REQUEST_GAME_STATE"
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

export interface GameStateMessage extends Message {
    type: MESSAGE_TYPE.GAME_STATE
    payload: {
        gameId: string
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

export interface RequestGameStateMessage extends Message {
    type: MESSAGE_TYPE.REQUEST_GAME_STATE
}
