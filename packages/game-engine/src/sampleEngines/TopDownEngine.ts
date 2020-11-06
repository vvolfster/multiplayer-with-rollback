import { PlayerInput, GameState } from "shared"
import { GameEngine, EngineRunHelpers } from "../GameEngine"

export class TopDownEngine {
    engine: GameEngine<PlayerInput, GameState>

    movespeed = 50

    constructor(gameId: string, movespeed?: number) {
        if (movespeed) {
            this.movespeed = movespeed
        }

        this.engine = new GameEngine<PlayerInput, GameState>(this.runFn, {
            gameId,
            dt: 0,
            id: 0,
            inputs: [],
            time: 0,
            entities: [],
            randNumber: 0
        })
    }

    private runFn = (state: GameState, helpers: EngineRunHelpers) => {
        if (state.time % 1000 === 0) {
            state.randNumber = helpers.chance().integer({ min: 0, max: 100 })
        }

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
