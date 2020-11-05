/* Button auto-generated by npm run generator */
import { Button, CircularProgress, Theme } from "@material-ui/core"
import { ButtonProps } from "@material-ui/core/Button"
import { makeStyles } from "@material-ui/styles"
import clsx from "clsx"
import { omit } from "lodash"
import React, { CSSProperties } from "react"

export interface BtnProps extends Omit<ButtonProps, "onClick"> {
    className?: string
    style?: CSSProperties
    children?: React.ReactNode

    onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => any
    loading?: boolean
}

const useStyles = makeStyles((theme: Theme) => ({
    buttonAtom: {
        position: "relative",
        padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`
    },
    spinnerContainer: {
        width: "100%",
        height: "100%",
        left: 0,
        top: 0,
        position: "absolute",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    }
}))

export const Btn: React.FC<BtnProps> = props => {
    const classes = useStyles()
    const className = clsx([classes.buttonAtom, props.className])

    const [promiseRunning, setPromiseRunning] = React.useState(false)
    const isWorking = promiseRunning || props.loading
    const aliveRef = React.useRef(true)

    React.useEffect(() => {
        // on dismount
        return () => {
            aliveRef.current = false
        }
    }, [])

    const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        if (props.onClick) {
            setPromiseRunning(true)
            Promise.resolve(props.onClick(e)).finally(() => {
                if (aliveRef.current) {
                    setPromiseRunning(false)
                }
            })
        }
    }

    let content
    if (!isWorking) {
        content = props.children
    } else {
        content = (
            <>
                <div style={{ opacity: 0 }}>{props.children}</div>
                <div className={classes.spinnerContainer}>
                    <CircularProgress size={24} />
                </div>
            </>
        )
    }

    const buttonProps = omit(props, ["loading", "variant", "color"])
    return (
        <Button
            {...buttonProps}
            className={className}
            style={props.style}
            onClick={handleClick}
            disabled={isWorking || props.disabled}
            variant={props.variant || "contained"}
            color={props.color || "primary"}
        >
            {content}
        </Button>
    )
}