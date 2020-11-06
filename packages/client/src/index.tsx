import "mobx-react-lite/batchingForReactDom"
import CssBaseLine from "@material-ui/core/CssBaseline"
import { ThemeProvider } from "@material-ui/styles"
import { boot } from "boot"
import { MainView } from "components/MainView"
import { observer } from "mobx-react-lite"
import React from "react"
import ReactDOM from "react-dom"
import { Theme } from "style"
import * as serviceWorker from "./serviceWorker"

async function main() {
    await boot()
    const rootElement = document.getElementById("root")
    const App = observer(() => {
        return (
            <ThemeProvider theme={Theme}>
                <CssBaseLine />
                <MainView />
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
