import { observer } from "mobx-react-lite"
import { Theme, makeStyles } from "@material-ui/core"
import { Btn } from "components/atoms/Btn"
import { Column } from "components/atoms/RowColumn"
import React from "react"
import { Padding } from "style"
import { navigate } from "@reach/router"
import { PATHS } from "Router"

const useStyles = makeStyles((theme: Theme) => ({
    page: {
        position: "relative",
        width: "100%",
        height: "100%",
        ...Padding(2)
    }
}))

export const Home: React.FC = observer(function Home() {
    const classes = useStyles()
    return (
        <Column justify="between" className={classes.page}>
            <Btn onClick={() => navigate(PATHS.ONE_PLAYER())}>Test 1P</Btn>
        </Column>
    )
})
