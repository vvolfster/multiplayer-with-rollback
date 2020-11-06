import { PlayerInput, BaseGameState, Entity } from "shared"
import { GameEngine } from "../GameEngine"

export interface TState extends BaseGameState<PlayerInput> {
    id: number
    time: number
    dt: number
    inputs: PlayerInput[]
    entities: Entity[]
}

export class TopDownEngine {
    engine: GameEngine<PlayerInput, TState>

    movespeed = 50

    constructor(movespeed?: number) {
        if (movespeed) {
            this.movespeed = movespeed
        }

        this.engine = new GameEngine<PlayerInput, TState>(this.runFn, { dt: 0, id: 0, inputs: [], time: 0, entities: [] })
    }

    private runFn = (state: TState) => {
        state.inputs.forEach(input => {
            let player = state.entities.find(e => e.id === input.playerId)
            if (!player) {
                player = {
                    id: input.playerId,
                    pos: { x: 0, y: 0 },
                    velocity: { x: 0, y: 0 }
                }
                state.entities.push(player)
            }

            const x = input.axis.x * state.dt * this.movespeed
            const y = input.axis.y * state.dt * this.movespeed

            player.velocity = { x, y }

            player.pos.x += x
            player.pos.y += y
        })
        return state
    }
}
