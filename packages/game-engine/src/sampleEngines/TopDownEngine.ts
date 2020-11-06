import { PlayerInput, GameState } from "shared"
import { GameEngine } from "../GameEngine"

export class TopDownEngine {
    engine: GameEngine<PlayerInput, GameState>

    movespeed = 50

    constructor(movespeed?: number) {
        if (movespeed) {
            this.movespeed = movespeed
        }

        this.engine = new GameEngine<PlayerInput, GameState>(this.runFn, {
            dt: 0,
            id: 0,
            inputs: [],
            time: 0,
            entities: [
                { id: "wolf", pos: { x: 0, y: 0 }, velocity: { x: 0, y: 0 } },
                { id: "bart", pos: { x: 0, y: 0 }, velocity: { x: 0, y: 0 } }
            ]
        })
    }

    private runFn = (state: GameState) => {
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
