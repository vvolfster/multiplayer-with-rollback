export interface PlayerInput {
    axis: {
        x: number
        y: number
    }
}

export interface Entity {
    id: number
    pos: {
        x: number
        y: number
    },
    velocity: {
        x: number
        y: number
    }
}