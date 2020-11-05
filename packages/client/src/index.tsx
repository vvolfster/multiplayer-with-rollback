// eslint-disable-next-line
import "mobx-react-lite/batchingForReactDom"
import { use100vh } from "react-div-100vh"
import CssBaseLine from "@material-ui/core/CssBaseline"
import { ThemeProvider } from "@material-ui/styles"
import { boot } from "boot"
import { observer } from "mobx-react-lite"
import { AppRouter } from "./Router"
import React from "react"
import ReactDOM from "react-dom"
import { Theme } from "style"
import * as serviceWorker from "./serviceWorker"

async function main() {
    await boot()
    const rootElement = document.getElementById("root")
    const Router = AppRouter.Main
    const App = observer(() => {
        const height = use100vh()
        return (
            <ThemeProvider theme={Theme}>
                <CssBaseLine />
                <Router style={{ width: "100vw", height: height || undefined, position: "relative" }} />
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
