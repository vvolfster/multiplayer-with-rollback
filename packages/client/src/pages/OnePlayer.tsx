import { Theme, Slider, TextField } from "@material-ui/core"
import { makeStyles } from "@material-ui/styles"
import { Btn } from "components/atoms/Btn"
import { PlayerInput, GameState } from "shared"
import { TopDownEngine } from "game-engine"
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
        transition: "all 0.08s"
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

class OnePlayerState {
    engine: TopDownEngine

    @observable
    state: GameState

    @observable
    input: PlayerInput

    @observable
    simulatedLag = 60

    onDestroy: () => void

    private setX(val: number) {
        if (this.input.axis.x !== val) {
            console.log("set x", val)
            const lagTime = new Date().getTime() - this.engine.engine.startTime - this.simulatedLag
            this.input.axis.x = val
            this.engine.engine.setInput(toJS(this.input), lagTime)
        }
    }
    private setY(val: number) {
        if (this.input.axis.y !== val) {
            console.log("set y", val)
            const lagTime = new Date().getTime() - this.engine.engine.startTime - this.simulatedLag
            this.input.axis.y = val
            this.engine.engine.setInput(toJS(this.input), lagTime)
        }
    }

    constructor() {
        this.engine = new TopDownEngine("localplayer", 100)
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

        this.engine.engine.startGameLoop(10, undefined, undefined, state => (this.state = state))
    }

    reset = () => {
        this.engine.engine.stopGameLoop()
        this.engine = new TopDownEngine("local", 100)
        this.state = this.engine.engine.currentState()
        this.input = {
            playerId: store.socketIO.userId,
            axis: {
                x: 0,
                y: 0
            }
        }

        this.engine.engine.startGameLoop(10, undefined, undefined, state => (this.state = state))
    }

    updateLagValue = (e: any, val: number | number[]) => {
        if (!isArray(val)) {
            this.simulatedLag = val
        }
    }
}

export const OnePlayerImpl: React.FC = observer(function OnePlayerImpl() {
    const classes = useStyles()
    const [componentState] = React.useState(() => new OnePlayerState())
    const ref = React.useRef<HTMLDivElement>(null)
    React.useEffect(() => componentState.onDestroy, [])

    const printState = {
        id: componentState.state.id,
        time: componentState.state.time,
        entities: componentState.state.entities.map(e => [e.id, e.pos.x, e.pos.y].join(" "))
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
                <pre>State {JSON.stringify(printState, null, 4)}</pre>
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

export const OnePlayer: React.FC = observer(function OnePlayer() {
    const { userId } = store.socketIO
    if (!userId) {
        return null
    }
    return <OnePlayerImpl />
})
