import { PaletteOptions } from "@material-ui/core/styles/createPalette"

const palette: PaletteOptions = {
    common: { black: "#000", white: "#fff" },
    // default is
    background: { paper: "#fff", default: "#B0D9FF" },
    primary: {
        light: "#62efff",
        main: "#00bcd4",
        dark: "#008ba3",
        contrastText: "#fafafa"
    },
    secondary: {
        light: "#52c7b8",
        main: "#009688",
        dark: "#00675b",
        contrastText: "#fafafa"
    },
    error: {
        light: "#e57373",
        main: "#f44336",
        dark: "#d32f2f",
        contrastText: "#fff"
    },
    text: {
        primary: "rgba(1, 8, 37, 0.87)",
        secondary: "rgba(1, 8, 37, 0.54)",
        disabled: "rgba(1, 8, 37, 0.38)",
        hint: "rgba(1, 8, 37, 0.45)"
    }
}
export default palette
