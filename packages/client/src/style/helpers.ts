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

export function Size(v: number | string, h?: number | string): React.CSSProperties {
    if (h === undefined) {
        const val = typeof v === "number" ? v * SPACING : v
        return { width: val, height: val }
    } else {
        const width = typeof v === "number" ? v * SPACING : v
        const height = typeof h === "number" ? h * SPACING : h
        return { width, height }
    }
}

export function Absolute(): React.CSSProperties {
    return {
        position: "absolute",
        left: 0,
        top: 0
    }
}

export function Relative(): React.CSSProperties {
    return {
        position: "relative"
    }
}
