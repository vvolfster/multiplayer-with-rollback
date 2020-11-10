import { Theme, Slider, TextField, makeStyles } from "@material-ui/core"
import { Btn } from "components/atoms/Btn"
import { MESSAGE_TYPE, PlayerInput, PlayerInputMessage, RequestGameStartMessage, GameState } from "shared"
import { TopDownEngine } from "game-engine"
import { observable, toJS } from "mobx"
import { observer } from "mobx-react-lite"
import React from "react"
import { Absolute, Padding, Size, Relative } from "style"
import MouseTrap from "mousetrap"
import { Column, Row } from "components/atoms/RowColumn"
import { isArray } from "lodash"
import store from "store/Store"

const UP = "up"
const DOWN = "down"
const LEFT = "left"
const RIGHT = "right"

const useStyles = makeStyles((theme: Theme) => ({
    page: {
        ...Relative(),
        ...Size("100%", "100%"),
        ...Padding(2),
        userSelect: "none"
    },
    player: {
        ...Size(4),
        background: "red",
        ...Absolute(),
        border: "solid 1px",
        borderRadius: "50%",
        transition: "all 0.2s"
    },
    playerName: {
        ...Absolute(0, theme.spacing(5))
    },
    debug: {
        ...Absolute(),
        userSelect: "none",
        top: "unset",
        left: "unset",
        right: theme.spacing(2),
        bottom: theme.spacing(2)
    }
}))

class MultiplayerState {
    engine: TopDownEngine

    @observable
    state: GameState

    @observable
    input: PlayerInput

    @observable
    uiUpdateTime = 0

    @observable static SimulatedLatency = 10

    @observable static IsCpu = false

    onDestroy: () => void

    @observable sendInputQueue: PlayerInputMessage[] = []

    private sendInputs = () => {
        this.sendInputQueue.forEach(msg => {
            console.log(`send input ${msg.payload.stateId}`, JSON.stringify(msg.payload.input.axis))
            setTimeout(() => store.socketIO.sendMsg(msg), MultiplayerState.SimulatedLatency)
        })
        this.sendInputQueue = []
    }

    private updateInput = (input: PlayerInput) => {
        this.input = input
        const stateId = this.engine.engine.currentStateId()
        const msg: PlayerInputMessage = {
            type: MESSAGE_TYPE.INPUT,
            ts: new Date().getTime(),
            payload: {
                input,
                stateId
            }
        }

        this.engine.engine.setInput({ input })
        const idx = this.sendInputQueue.findIndex(q => q.payload.stateId === stateId)
        if (idx === -1) {
            this.sendInputQueue.push(msg)
        } else {
            this.sendInputQueue[idx] = msg
        }
    }

    private setX(val: number) {
        if (this.input.axis.x === val) {
            return
        }

        const payload = toJS(this.input)
        payload.axis.x = val
        this.updateInput(payload)
    }
    private setY(val: number) {
        if (this.input.axis.y === val) {
            return
        }

        const payload = toJS(this.input)
        payload.axis.y = val
        this.updateInput(payload)
    }

    private lastUpdate = 0

    private updateUIState = (state: GameState) => {
        this.sendInputs()
        if (MultiplayerState.IsCpu) {
            const mod = state.id % 20
            if (mod >= 15) {
                this.setX(-1)
            } else if (mod >= 10) {
                this.setX(0)
            } else if (mod >= 5) {
                this.setX(1)
            } else {
                this.setX(0)
            }
        }

        // we are in the past by how fast our simulation runs?
        setTimeout(() => {
            const d = new Date().getTime()
            if (this.lastUpdate) {
                this.uiUpdateTime = d - this.lastUpdate
            }
            this.lastUpdate = d
            this.state = state
        }, 0)
    }

    constructor() {
        this.engine = new TopDownEngine("", 100)
        this.state = this.engine.engine.currentState()
        this.input = {
            playerId: store.socketIO.userId,
            axis: {
                x: 0,
                y: 0
            }
        }

        MouseTrap.bind(UP, () => this.setY(-1), "keydown")
        MouseTrap.bind(DOWN, () => this.setY(1), "keydown")
        MouseTrap.bind(LEFT, () => this.setX(-1), "keydown")
        MouseTrap.bind(RIGHT, () => this.setX(1), "keydown")

        MouseTrap.bind([UP, DOWN], () => this.setY(0), "keyup")
        MouseTrap.bind([LEFT, RIGHT], () => this.setX(0), "keyup")

        const unsub1 = store.socketIO.addGameStateListener(msg => {
            this.engine.engine.stopGameLoop()

            this.engine = new TopDownEngine(msg.payload.gameId, 100)
            this.engine.engine.loadFromState(msg.payload.states)
            this.engine.engine.startGameLoop({
                fps: 10,
                startTime: msg.payload.startTime,
                gameTime: msg.payload.gameTime,
                onStateUpdate: this.updateUIState
            })
        })

        const msg: RequestGameStartMessage = {
            type: MESSAGE_TYPE.REQUEST_GAME_START,
            payload: {
                restartGame: false
            }
        }
        store.socketIO.sendMsg(msg)

        const unsub2 = store.socketIO.addPlayerInputListener(msg => {
            const { payload, ts } = msg
            const { input, stateId } = payload
            this.engine.engine.setInput({ ts, input, stateId })
        })

        this.onDestroy = () => {
            MouseTrap.unbind(UP, "keydown")
            MouseTrap.unbind(DOWN, "keydown")
            MouseTrap.unbind(LEFT, "keydown")
            MouseTrap.unbind(RIGHT, "keydown")
            MouseTrap.unbind([UP, DOWN], "keyup")
            MouseTrap.unbind([LEFT, RIGHT], "keyup")
            this.engine.engine.stopGameLoop()
            unsub1()
            unsub2()
        }
    }

    reset = () => {
        this.engine.engine.stopGameLoop()
        const msg: RequestGameStartMessage = {
            type: MESSAGE_TYPE.REQUEST_GAME_START,
            payload: {
                restartGame: true
            }
        }
        store.socketIO.sendMsg(msg)
    }

    updateLagValue = (e: any, val: number | number[]) => {
        if (!isArray(val)) {
            MultiplayerState.SimulatedLatency = val
        }
    }
}

interface MultiplayerImplProps {
    refresh?: () => void
}

export const MultiplayerImpl: React.FC<MultiplayerImplProps> = observer(function OnePlayerImpl(props) {
    const classes = useStyles()
    const [componentState] = React.useState(() => new MultiplayerState())
    const ref = React.useRef<HTMLDivElement>(null)
    React.useEffect(() => {
        return () => {
            componentState.onDestroy()
            console.log("destroyed")
        }
    }, [])

    const printState = {
        uiRefreshMs: componentState.uiUpdateTime,
        gameId: componentState.state.gameId,
        id: componentState.state.id,
        time: componentState.state.time,
        entities: componentState.state.entities.map(e => [e.id, e.pos.x, e.pos.y].join(" ")),
        randNumber: componentState.state.randNumber
    }

    const players = componentState.state.entities.map(entity => {
        const style = { left: entity.pos.x, top: entity.pos.y }
        return (
            <div key={entity.id} className={classes.player} style={style}>
                <div className={classes.playerName}>{entity.id}</div>
            </div>
        )
    })

    return (
        <div className={classes.page} ref={ref} onClick={() => ref.current?.focus()}>
            {players}
            <div className={classes.debug}>
                <pre style={{ fontSize: 24 }}>{JSON.stringify(printState, null, 4)}</pre>
                <Column align="stretch">
                    <Row align="center" justify="between">
                        <Btn variant="outlined" size="small" onClick={() => (MultiplayerState.IsCpu = !MultiplayerState.IsCpu)}>
                            CPU ({MultiplayerState.IsCpu ? "On" : "Off"})
                        </Btn>
                        <Btn variant="outlined" size="small" onClick={componentState.reset}>
                            Reset
                        </Btn>
                        <Btn x-if={props.refresh} variant="outlined" size="small" onClick={props.refresh}>
                            Refresh
                        </Btn>
                    </Row>
                    <Row align="center" padding={2}>
                        <Slider
                            style={{ minWidth: 150, marginRight: 8 }}
                            value={MultiplayerState.SimulatedLatency}
                            min={0}
                            max={5000}
                            name="Simulated Latency"
                            onChange={componentState.updateLagValue}
                        />
                        <TextField
                            label="ms"
                            type="number"
                            value={MultiplayerState.SimulatedLatency}
                            onChange={e => componentState.updateLagValue(undefined, Number(e.target.value))}
                        />
                    </Row>
                </Column>
            </div>
        </div>
    )
})

export const Multiplayer: React.FC = observer(function Multiplayer() {
    const { userId } = store.socketIO
    const [refresh, setRefresh] = React.useState(false)
    const doRefresh = () => {
        setRefresh(true)
        setTimeout(() => setRefresh(false), 10)
    }

    if (!userId || refresh) {
        return null
    }

    return <MultiplayerImpl refresh={doRefresh} />
})
