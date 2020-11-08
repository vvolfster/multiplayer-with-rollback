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

    private replaceInput = (inputs: I[], updateInput: I) => {
        const idx = inputs.findIndex(i => i.playerId === updateInput.playerId)
        if (idx !== -1) {
            inputs[idx] = updateInput
        } else {
            inputs.push(updateInput)
        }
    }

    private replaceInputInState = (state: G, input: I) => {
        this.replaceInput(state.inputs, input)
    }

    private processInputQueue = () => {
        const { inputQueue } = this
        const currentStateId = this.currentStateId()
        const indicesToRemove: number[] = []

        // separate the input queue into
        for (let i = 0; i < inputQueue.length; i++) {
            const queueItem = inputQueue[i]
            if (queueItem.stateId > currentStateId) {
                // process more next game step
                console.log("time/space contiunum error", queueItem.stateId - currentStateId)
                break
            } else {
                const { input, stateId } = queueItem
                const iii = input as any
                const stateIdx = stateId === undefined ? -1 : this.states.findIndex(s => s.id === stateId)
                if (stateIdx === -1) {
                    console.log(`Set input packed arrived too late. ${stateId} is no longer in the array (processInputQueue)`)
                } else {
                    console.log("handle input queue", stateId, JSON.stringify(iii.axis))
                    this.run({ stateIdx, input })
                    indicesToRemove.push(i)
                }
            }
        }

        indicesToRemove.reverse().forEach(i => inputQueue.splice(i, 1))
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
            if (!states[idx]) {
                throw new Error("GameEngine::run no state")
            }

            for (let i = idx; i < states.length; i++) {
                if (i === idx) {
                    // since this "correct" input would affect the next state, we dont
                    // change this state. just its input
                    this.replaceInputInState(states[i], input)
                } else {
                    // the state at index i is inaccurate. however, we want to keep the other players' inputs from it
                    const s = states[i]
                    this.replaceInput(s.inputs, input)

                    // clone the previous state, generate new state from it
                    const toBeNewState = cloneDeep(states[i - 1])
                    toBeNewState.id = s.id
                    toBeNewState.time = s.time
                    toBeNewState.dt = s.dt

                    states[i] = this.runFn(toBeNewState, this.getEngineRunHelpers(toBeNewState))

                    // now re-apply the inputs to it so the next state we generate from this updated state is ok
                    states[i].inputs = s.inputs
                }
            }
        }
    }

    setInput = (input: I, stateId?: number) => {
        const { states } = this

        // this is local input. no need to put it on the queue
        if (stateId === undefined) {
            // this is a new input that should be applied on the next run call
            // we can effectively do this by replacing the input of the last
            // state we have
            if (states.length) {
                this.replaceInputInState(states[states.length - 1], input)
            }
        } else {
            // if state id is less than the very first state we have in the array,
            // then this means we got this input too late. this means that the input packet
            // took too long to get to us and we will be desynced. we need to request new states!
            if (stateId < states[0].id) {
                console.log(`Set input packed arrived too late. ${stateId} is no longer in the array`)
                return
            }

            const iii = input as any
            this.inputQueue.push({ input, stateId })
            console.log("Pushed to queue", stateId, JSON.stringify(iii.axis))
        }
    }

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
            didUpdateState = false
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
                this.processInputQueue()
                // if there's a state update. do that
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

    // getters
    allStates = () => this.states
    currentState = () => {
        const { states } = this
        return cloneDeep(states[states.length - 1])
    }
    currentStateId = () => {
        const { states } = this
        if (!states.length) {
            return 0
        }
        return states[states.length - 1].id
    }
    gameId = () => {
        const { states } = this
        return !states.length ? "" : states[states.length - 1].gameId
    }
}
