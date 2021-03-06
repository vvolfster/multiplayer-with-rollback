import { CSSProperties } from "@material-ui/styles"
import { SPACING } from "./config/spacing"

export function Padding(v: number, h?: number) {
    if (!h) {
        const val = SPACING * v
        return { padding: `${val}px ${val}px` }
    } else {
        const y = SPACING * v
        const x = SPACING * v
        return { padding: `${y}px ${x}px` }
    }
}

export function Margin(v: number, h?: number) {
    if (!h) {
        const val = SPACING * v
        return { margin: `${val}px ${val}px` }
    } else {
        const y = SPACING * v
        const x = SPACING * v
        return { margin: `${y}px ${x}px` }
    }
}

export function Size(v: number | string, h?: number | string): CSSProperties {
    if (h === undefined) {
        const val = typeof v === "number" ? v * SPACING : v
        return { width: val, height: val }
    } else {
        const width = typeof v === "number" ? v * SPACING : v
        const height = typeof h === "number" ? h * SPACING : h
        return { width, height }
    }
}

export function Absolute(left: number | string = 0, top: number | string = 0): CSSProperties {
    return {
        position: "absolute",
        left,
        top
    }
}

export function Relative(): CSSProperties {
    return {
        position: "relative"
    }
}
