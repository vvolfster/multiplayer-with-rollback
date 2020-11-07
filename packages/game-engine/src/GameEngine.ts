import Chance from "chance"
import { BaseGameState, BaseInput } from "shared"
import { cloneDeep, times } from "lodash"

export interface EngineRunHelpers {
    chance: () => Chance.Chance
}

export type EngineRunFn<I extends BaseInput, G extends BaseGameState<I>> = (state: G, helpers: EngineRunHelpers) => G

export interface GameStateRecalculateWithInput<I extends BaseInput> {
    stateIdx: number
    input: I
}

export type RunParams<I extends BaseInput> = GameStateRecalculateWithInput<I> | { time: number; dt: number }

interface InputQueueItem<I extends BaseInput> {
    input: I
    stateId: number
}
export class GameEngine<I extends BaseInput, G extends BaseGameState<I>> {
    public startTime = 0

    private runFn: EngineRunFn<I, G>
    private states: G[] = []
    private numStatesToKeep = 50
    private exitGameLoopFn?: () => void
    private inputQueue: InputQueueItem<I>[] = []

    private getEngineRunHelpers = (state: G): EngineRunHelpers => {
        const seed = [state.gameId, state.id].join("-")
        return {
            chance: () => new Chance(seed)
        }
    }

    private isGameStateWithRelac = (obj: any): obj is GameStateRecalculateWithInput<I> => {
        return obj && typeof obj.stateIdx === "number"
    }

    private replaceInput = (state: G, input: I) => {
        const idx = state.inputs.findIndex(i => i.playerId === input.playerId)
        if (idx !== -1) {
            state.inputs[idx] = input
        } else {
            state.inputs.push(input)
        }
    }

    constructor(engineRunFn: EngineRunFn<I, G>, startingState: G) {
        this.runFn = engineRunFn
        this.states = [startingState]
    }

    run = (params: RunParams<I>) => {
        const { states } = this
        if (!this.isGameStateWithRelac(params)) {
            const { time, dt } = params
            const state = cloneDeep(states[states.length - 1])
            if (!state) {
                throw new Error("GameEngine::run no state")
            }

            state.id += 1
            state.time = time
            state.dt = dt
            const newState = this.runFn(state, this.getEngineRunHelpers(state))
            states.push(newState)

            // after we finish, make sure we only keep what we need
            this.states = this.states.slice(-this.numStatesToKeep)
        } else {
            const { input } = params
            const idx = params.stateIdx
            const state = cloneDeep(states[idx])
            if (!state) {
                throw new Error("GameEngine::run no state")
            }

            // playback all states to the current one
            const numStatesToRewrite = states.length - idx
            times(numStatesToRewrite, i => {
                const thisIdx = idx + i
                if (thisIdx === idx) {
                    // since this "correct" input would affect the next state, we dont
                    // change this state. just its input
                    this.replaceInput(states[thisIdx], input)
                } else {
                    // we need to keep the inputs of all other players the same (in the states we are overwriting)
                    // replace this state's input
                    const s = states[thisIdx]
                    this.replaceInput(s, input)

                    // clone the previous state, apply this state's updated inputs to it. then run the fn
                    const prevState = cloneDeep(states[thisIdx - 1])
                    prevState.inputs = s.inputs
                    prevState.id = s.id
                    prevState.time = s.time
                    prevState.dt = s.dt

                    states[thisIdx] = this.runFn(prevState, this.getEngineRunHelpers(prevState))
                }
            })
        }
    }

    setInput = (input: I, stateId?: number) => {
        const { states } = this
        const stateIdx = stateId === undefined ? -1 : states.findIndex(s => s.id === stateId)

        // this is local input. no need to put it on the queue
        if (stateIdx === -1) {
            // this is a new input that should be applied on the next run call
            // we can effectively do this by replacing the input of the last
            // state we have
            if (states.length) {
                this.replaceInput(states[states.length - 1], input)
            }
        } else if (stateId !== undefined) {
            // this is an old input that we are just receiving now. So we should
            // re-calc. We do this by adding this input into the inputQueue to process in the game loop
            const idx = this.inputQueue.findIndex(q => q.stateId === stateId && q.input.playerId === input.playerId)
            if (idx !== -1) {
                this.inputQueue[idx] = { input, stateId }
            } else {
                this.inputQueue.push({ input, stateId })
            }
        }
    }

    currentState = () => {
        const { states } = this
        return cloneDeep(states[states.length - 1])
    }

    allStates = () => this.states

    startGameLoop = (fps: number, startTime = new Date().getTime(), gameTime = 0, onStateUpdate?: (g: G) => any) => {
        // kill any current loop if running
        this.stopGameLoop()

        // the tickTime basically tells us how often a frame is generated
        const tickTimeMs = 1000 / fps
        const timeTimeSeconds = tickTimeMs / 1000
        const looperFn = typeof window === "undefined" ? setImmediate : requestAnimationFrame

        this.numStatesToKeep = fps * 5
        console.log("num states to keep", this.numStatesToKeep)
        this.startTime = startTime

        let time = gameTime
        let quit = false
        let accumulator = 0
        let didUpdateState = false
        let frameTime = this.startTime
        let currentTime = new Date().getTime()

        const loop = () => {
            if (quit) {
                console.log("Finished game loop after", time.valueOf(), "ms")
                return
            }

            // do normal game loop
            const now = new Date().getTime()
            frameTime = now - currentTime
            accumulator += frameTime
            currentTime = now

            // when the accumulator builds up greater than tickTimeMs, step the simulation forward as many times as needed
            while (accumulator >= tickTimeMs) {
                didUpdateState = true
                time += tickTimeMs
                this.run({ time, dt: timeTimeSeconds })
                accumulator -= tickTimeMs
            }

            // handle input queues only on ticks where the state was updated
            if (didUpdateState) {
                // if there is input queued up (from the network), handle it first
                // handle only input queue len at the start of this loop
                while (this.inputQueue.length) {
                    const queueItem = this.inputQueue.shift()
                    if (queueItem) {
                        const { input, stateId } = queueItem
                        const stateIdx = stateId === undefined ? -1 : this.states.findIndex(s => s.id === stateId)
                        this.run({ stateIdx, input })
                        // console.log(
                        //     `re-calculated (${stateId}) from idx: ${stateIdx} which is ${this.states.length - 1 - stateIdx} states ago: ${JSON.stringify(
                        //         input
                        //     )}`
                        // )
                    }
                }

                if (onStateUpdate) {
                    onStateUpdate(this.currentState())
                }
            }

            looperFn(loop)
        }

        loop()
        this.exitGameLoopFn = () => (quit = true)
    }

    stopGameLoop = () => {
        if (this.exitGameLoopFn) {
            this.exitGameLoopFn()
            this.exitGameLoopFn = undefined
        }
    }

    loadFromState = (states: G[]) => {
        console.log("loaded", states.length)
        this.states = states
    }

    currentStateId = () => {
        if (!this.states.length) {
            return 0
        }
        return this.states[this.states.length - 1].id
    }

    gameId = () => {
        const [first] = this.states
        if (!first) {
            return ""
        }
        return first.gameId
    }
}
