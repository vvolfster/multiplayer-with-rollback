import { createMuiTheme } from "@material-ui/core/styles"
import { CSSProperties } from "@material-ui/styles"
import jss from "jss"
import jssPluginGlobal from "jss-plugin-global"
import breakpoints from "./config/breakpoints"
import palette from "./config/palette"
import spacing from "./config/spacing"
import typography from "./config/typography"
export * from "./helpers"

jss.use(jssPluginGlobal())

export const Theme = createMuiTheme({
    typography,
    palette,
    breakpoints,
    spacing
})

export const PageWithoutBar: CSSProperties = {
    position: "relative",
    width: "100%",
    flexGrow: 1,
    display: "flex",
    flexFlow: "column",
    alignItems: "stretch"
}
