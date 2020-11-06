export interface BaseInput {
    playerId: number | string
}

export interface BaseGameState<I extends BaseInput> {
    gameId: string // unique random id. this needs to be agreed on by players
    id: number // tick id
    time: number // current game time
    dt: number // step time
    inputs: I[] // player inputs

    // random numbers are generated using the gameId and id
}

export interface PlayerInput extends BaseInput {
    playerId: string
    axis: {
        x: number
        y: number
    }
}

export interface Entity {
    id: string
    pos: {
        x: number
        y: number
    }
    velocity: {
        x: number
        y: number
    }
}

export interface GameState extends BaseGameState<PlayerInput> {
    id: number
    time: number
    dt: number
    inputs: PlayerInput[]
    entities: Entity[]
    randNumber: number
}
