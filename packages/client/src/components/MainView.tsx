import store from "store/Store"
import { Theme as MuiTheme } from "@material-ui/core"
import { makeStyles } from "@material-ui/styles"
import { navigate } from "@reach/router"
import { observer } from "mobx-react-lite"
import { use100vh } from "react-div-100vh"
import "mobx-react-lite/batchingForReactDom"
import React from "react"
import { getPageName, PATHS } from "Router"
import { Padding, Relative } from "style"
import { Btn } from "./atoms/Btn"
import { Menu } from "./atoms/Menu"
import { Column, Row } from "./atoms/RowColumn"
import { AppRouter } from "../Router"

const useStyles = makeStyles((theme: MuiTheme) => ({
    mainView: {
        width: "100vw",
        overflow: "hidden"
    },
    topBar: {
        height: theme.spacing(8),
        border: "solid 1px black",
        background: theme.palette.grey.A100,
        ...Padding(2)
    },
    router: {
        ...Relative(),
        flexGrow: 1,
        overflow: "auto"
    }
}))

interface MainViewProps {
    className?: string
    style?: React.CSSProperties
}

export const TopBar: React.FC = observer(function TopBar() {
    const classes = useStyles()
    const menuItems = [
        {
            name: "One player",
            action: () => navigate(PATHS.ONE_PLAYER())
        },
        {
            name: "Multiplayer",
            action: () => navigate(PATHS.MULTI_PLAYER())
        },
        {
            name: "Logout",
            action: () => {
                store.socketIO.userId = ""
            }
        }
    ]

    return (
        <Row className={classes.topBar} align="center" justify="between">
            <h3>{store.socketIO.userId}</h3>
            <h3>{getPageName(window.location.hostname)}</h3>
            <Menu targetNode={<Btn>Menu</Btn>} menuItems={menuItems} />
        </Row>
    )
})

export const MainView: React.FC<MainViewProps> = observer(function MainView(props) {
    const Router = AppRouter.Main
    const classes = useStyles()
    const height = use100vh() || undefined
    const { userId } = store.socketIO
    React.useEffect(() => {
        if (!userId) {
            store.socketIO.setUserId()
        }
    }, [userId])

    if (!userId) {
        return null
    }

    return (
        <Column align="stretch" style={{ height }}>
            <TopBar />
            <Router style={{ height }} className={classes.router} />
        </Column>
    )
})
