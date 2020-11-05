import { makeStyles } from "@material-ui/styles"
import "mobx-react-lite/batchingForReactDom"
import { use100vh } from "react-div-100vh"
import CssBaseLine from "@material-ui/core/CssBaseline"
import { ThemeProvider } from "@material-ui/styles"
import { boot } from "boot"
import { observer } from "mobx-react-lite"
import { AppRouter } from "./Router"
import React from "react"
import ReactDOM from "react-dom"
import { Relative, Theme } from "style"
import * as serviceWorker from "./serviceWorker"
import { Theme as MuiTheme } from "@material-ui/core"

const useStyles = makeStyles((theme: MuiTheme) => ({
    router: {
        width: "100vw",
        ...Relative()
    }
}))

async function main() {
    await boot()
    const rootElement = document.getElementById("root")
    const Router = AppRouter.Main
    const App = observer(() => {
        const classes = useStyles()
        const height = use100vh() || undefined
        return (
            <ThemeProvider theme={Theme}>
                <CssBaseLine />
                <Router style={{ height }} className={classes.router} />
            </ThemeProvider>
        )
    })

    ReactDOM.render(<App />, rootElement)

    // If you want your app to work offline and load faster, you can change
    // unregister() to register() below. Note this comes with some pitfalls.
    // Learn more about service workers: https://bit.ly/CRA-PWA
    serviceWorker.unregister()
}

main()
