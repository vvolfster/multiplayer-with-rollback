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
        transition: "all 0.166s"
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

    @observable static SimulatedLatency = 200

    onDestroy: () => void

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

        this.engine.engine.setInput(input)
        setTimeout(() => store.socketIO.sendMsg(msg), MultiplayerState.SimulatedLatency)

        console.log(`update input at ${stateId}`, input.axis)
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
            this.engine.engine.startGameLoop(10, msg.payload.startTime, msg.payload.gameTime, state => (this.state = state))
        })

        const msg: RequestGameStartMessage = {
            type: MESSAGE_TYPE.REQUEST_GAME_START,
            payload: {
                restartGame: false
            }
        }
        store.socketIO.sendMsg(msg)

        const unsub2 = store.socketIO.addPlayerInputListener(msg => {
            this.engine.engine.setInput(msg.payload.input, msg.payload.stateId)
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
    React.useEffect(() => componentState.onDestroy, [])

    const printState = {
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
