import { GameEngine, GameState, InputState } from "../GameEngine"

export interface TInput extends InputState {
    playerId: number
    axis: {
        x: number
        y: number
    }
}

export interface Entity {
    id: number
    pos: { x: number; y: number }
}

export interface TState extends GameState<InputState> {
    id: number
    time: number
    dt: number
    inputs: TInput[]
    entities: Entity[]
}

export class TopDownEngine {
    engine: GameEngine<TInput, TState>

    movespeed = 50

    constructor(movespeed?: number) {
        if (movespeed) {
            this.movespeed = movespeed
        }

        this.engine = new GameEngine<TInput, TState>(this.runFn, { dt: 0, id: 0, inputs: [], time: 0, entities: [] })
    }

    private runFn = (state: TState) => {
        state.inputs.forEach(input => {
            let player = state.entities.find(e => e.id === input.playerId)
            if (!player) {
                player = {
                    id: input.playerId,
                    pos: { x: 0, y: 0 }
                }
                state.entities.push(player)
            }

            const moveX = input.axis.x * state.dt * this.movespeed
            const moveY = input.axis.y * state.dt * this.movespeed

            player.pos.x += moveX
            player.pos.y += moveY
        })
        return state
    }
}
