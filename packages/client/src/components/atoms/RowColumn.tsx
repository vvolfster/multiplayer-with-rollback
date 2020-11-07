/* Button auto-generated by npm run generator */
import { Theme, makeStyles } from "@material-ui/core"
import clsx from "clsx"
import React, { CSSProperties } from "react"
import { SPACING } from "style/config/spacing"

export type RowColumnAlignType = "center" | "start" | "end" | "stretch"
export type RowColumnJustifyType = "center" | "start" | "end" | "between"

export interface RowColumnProps {
    className?: string
    style?: CSSProperties

    align?: RowColumnAlignType
    justify?: RowColumnJustifyType
    padding?: number
    margin?: number
}

const useStyles = makeStyles((theme: Theme) => ({
    row: {
        display: "flex",
        flexFlow: "row"
    },
    column: {
        display: "flex",
        flexFlow: "column"
    },
    alignCenter: {
        alignItems: "center"
    },
    alignStart: {
        alignItems: "flex-start"
    },
    alignEnd: {
        alignItems: "flex-end"
    },
    alignStretch: {
        alignItems: "stretch"
    },
    justifyCenter: {
        justifyContent: "center"
    },
    justifyStart: {
        justifyContent: "flex-start"
    },
    justifyEnd: {
        justifyContent: "flex-end"
    },
    justifyBetween: {
        justifyContent: "space-between"
    }
}))

function getAlignClass(type: RowColumnAlignType | undefined, classes: ReturnType<typeof useStyles>) {
    switch (type) {
        case "center":
            return classes.alignCenter
        case "end":
            return classes.alignEnd
        case "stretch":
            return classes.alignStretch
        default:
            return classes.alignStart
    }
}

function getJustifyClass(type: RowColumnJustifyType | undefined, classes: ReturnType<typeof useStyles>) {
    switch (type) {
        case "center":
            return classes.justifyCenter
        case "end":
            return classes.justifyEnd
        case "between":
            return classes.justifyBetween
        default:
            return classes.justifyStart
    }
}

export const Row: React.FC<RowColumnProps> = props => {
    const classes = useStyles()
    const alignClass = getAlignClass(props.align, classes)
    const justifyClass = getJustifyClass(props.justify, classes)
    const style = {
        ...props.style,
        margin: props.margin ? props.margin * SPACING : undefined,
        padding: props.padding ? props.padding * SPACING : undefined
    }

    const className = clsx(classes.row, props.className, alignClass, justifyClass)
    return (
        <div className={clsx(className)} style={style}>
            {props.children}
        </div>
    )
}

export const Column: React.FC<RowColumnProps> = props => {
    const classes = useStyles()
    const alignClass = getAlignClass(props.align, classes)
    const justifyClass = getJustifyClass(props.justify, classes)
    const style = {
        ...props.style,
        margin: props.margin ? props.margin * SPACING : undefined,
        padding: props.padding ? props.padding * SPACING : undefined
    }

    const className = clsx(classes.column, props.className, alignClass, justifyClass)
    return (
        <div className={clsx(className)} style={style}>
            {props.children}
        </div>
    )
}
