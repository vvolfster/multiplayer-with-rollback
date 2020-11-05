import { cloneDeep, times } from "lodash"

export interface InputState {
    playerId: number
}

export interface GameState<I extends InputState> {
    id: number
    time: number
    dt: number
    inputs: I[]
}

export type EngineRunFn<I extends InputState, G extends GameState<I>> = (state: G) => G

export interface GameStateRecalculateWithInput<I extends InputState> {
    stateIdx: number
    input: I
}

export type RunParams<I extends InputState> = GameStateRecalculateWithInput<I> | { time: number; dt: number }

export class GameEngine<I extends InputState, G extends GameState<I>> {
    public startTime = 0

    private runFn: EngineRunFn<I, G>
    private states: G[] = []
    private numStatesToKeep = 50
    private exitGameLoopFn?: () => void
    private isRollingBack = false

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
            const newState = this.runFn(state)
            states.push(newState)
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
                const stateIdx = idx + i
                if (stateIdx === idx) {
                    const s = states[stateIdx]

                    // update input of this particular player on this state
                    this.replaceInput(s, input)
                    states[stateIdx] = this.runFn(s)
                } else {
                    // we need to keep the inputs of all other players the same (in the states we are overwriting)
                    const s = states[stateIdx]
                    this.replaceInput(s, input)

                    // clone the previous state, apply the inputs to it. then run the fn
                    const prevState = cloneDeep(states[stateIdx - 1])
                    prevState.inputs = s.inputs
                    prevState.id = s.id
                    prevState.time = s.time
                    prevState.dt = s.dt

                    states[stateIdx] = this.runFn(prevState)
                }
            })
        }

        // after we finish, make sure we only keep what we need
        this.states = this.states.slice(-this.numStatesToKeep)
    }

    setInput = (input: I, ts?: number) => {
        const { states } = this
        const timestamp = ts || new Date().getTime() - this.startTime
        const stateIdx = states.findIndex(s => s.time >= timestamp)
        if (stateIdx === -1) {
            // this is a new input that should be applied on the next run call
            // we can effectively do this by replacing the input of the last
            // state we have
            this.replaceInput(states[states.length - 1], input)
        } else {
            // this is an old input that we are just receiving now. So we should
            // re-calc
            this.isRollingBack = true
            this.run({ stateIdx, input })
            console.log("re-calculating from", stateIdx, "which is", this.states.length - 1 - stateIdx, "states ago")
            this.isRollingBack = false
        }
    }

    currentState = () => {
        const { states } = this
        return cloneDeep(states[states.length - 1])
    }

    allStates = () => this.states

    startGameLoop = (fps: number, onStateUpdate?: (g: G) => any) => {
        // kill any current loop if running
        this.stopGameLoop()

        // we should keep 2 seconds worth of frames
        // the tickTime basically tells us how often a frame is generated
        const tickTimeMs = 1000 / fps
        const timeTimeSeconds = tickTimeMs / 1000

        this.numStatesToKeep = fps * 5
        console.log("num states to keep", this.numStatesToKeep)
        this.startTime = new Date().getTime()

        let time = 0
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

            const now = new Date().getTime()
            frameTime = now - currentTime
            accumulator += frameTime
            currentTime = now

            while (!this.isRollingBack && accumulator >= tickTimeMs) {
                didUpdateState = true
                time += tickTimeMs
                this.run({ time, dt: timeTimeSeconds })
                accumulator -= tickTimeMs
            }

            if (didUpdateState && onStateUpdate) {
                onStateUpdate(this.currentState())
            }

            setImmediate(loop)
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
}
