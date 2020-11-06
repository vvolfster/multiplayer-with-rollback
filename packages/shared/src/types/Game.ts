export interface BaseInput {
    playerId: number | string
}

export interface BaseGameState<I extends BaseInput> {
    id: number
    time: number
    dt: number
    inputs: I[]
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
