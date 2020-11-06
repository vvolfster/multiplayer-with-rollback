import { Theme, Slider, TextField } from "@material-ui/core"
import { makeStyles } from "@material-ui/styles"
import { Btn } from "components/atoms/Btn"
import { MESSAGE_TYPE, PlayerInput, PlayerInputMessage } from "shared"
import { TopDownEngine, TState } from "game-engine"
import { observable, toJS } from "mobx"
import { observer } from "mobx-react-lite"
import React from "react"
import { Absolute, Padding, Relative, Size } from "style"
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
    debug: {
        ...Absolute(),
        userSelect: "none",
        top: "unset",
        left: "unset",
        right: theme.spacing(2),
        bottom: theme.spacing(2)
    }
}))

class OnePlayerState {
    engine: TopDownEngine

    @observable
    state: TState

    @observable
    input: PlayerInput

    @observable
    simulatedLag = 60

    onDestroy: () => void

    private updateInput = (payload: PlayerInput) => {
        this.input = payload
        const lagTime = new Date().getTime() - this.engine.engine.startTime - this.simulatedLag
        const msg: PlayerInputMessage = {
            type: MESSAGE_TYPE.INPUT,
            ts: lagTime,
            payload
        }

        store.socketIO.sendMsg(msg)
        this.engine.engine.setInput(payload, lagTime)
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
        this.engine = new TopDownEngine(100)
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

        this.onDestroy = () => {
            MouseTrap.unbind(UP, "keydown")
            MouseTrap.unbind(DOWN, "keydown")
            MouseTrap.unbind(LEFT, "keydown")
            MouseTrap.unbind(RIGHT, "keydown")
            MouseTrap.unbind([UP, DOWN], "keyup")
            MouseTrap.unbind([LEFT, RIGHT], "keyup")
            this.engine.engine.stopGameLoop()
        }

        this.engine.engine.startGameLoop(10, state => (this.state = state))
    }

    reset = () => {
        this.engine.engine.stopGameLoop()
        this.engine = new TopDownEngine(100)
        this.state = this.engine.engine.currentState()
        this.input = {
            playerId: store.socketIO.userId,
            axis: {
                x: 0,
                y: 0
            }
        }

        this.engine.engine.startGameLoop(30, state => (this.state = state))
    }

    updateLagValue = (e: any, val: number | number[]) => {
        if (!isArray(val)) {
            this.simulatedLag = val
        }
    }
}

export const MultiplayerImpl: React.FC = observer(function OnePlayerImpl() {
    const classes = useStyles()
    const [componentState] = React.useState(() => new OnePlayerState())
    const ref = React.useRef<HTMLDivElement>(null)
    React.useEffect(() => componentState.onDestroy, [])

    const players = componentState.state.entities.map(entity => {
        const style = { left: entity.pos.x, top: entity.pos.y }
        return <div key={entity.id} className={classes.player} style={style} />
    })

    return (
        <div className={classes.page} ref={ref} onClick={() => ref.current?.focus()}>
            {players}
            <div className={classes.debug}>
                <pre>Input {JSON.stringify(componentState.input.axis, null, 4)}</pre>
                <pre>State {JSON.stringify(componentState.state, null, 4)}</pre>
                <Column>
                    <Btn onClick={componentState.reset}>Reset</Btn>
                    <Row align="center" padding={2}>
                        <Slider
                            style={{ minWidth: 150, marginRight: 8 }}
                            value={componentState.simulatedLag}
                            min={0}
                            max={5000}
                            name="SimulatedLag"
                            onChange={componentState.updateLagValue}
                        />
                        <TextField
                            label="simulated lag"
                            type="number"
                            value={componentState.simulatedLag}
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
    if (!userId) {
        return null
    }
    return <MultiplayerImpl />
})
