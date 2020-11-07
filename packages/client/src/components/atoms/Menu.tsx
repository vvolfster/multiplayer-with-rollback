import { Popover, Theme, makeStyles } from "@material-ui/core"
import React, { CSSProperties } from "react"
import { Btn } from "./Btn"
import { Column } from "./RowColumn"

const useStyles = makeStyles((theme: Theme) => ({
    menuBtn: {
        margin: theme.spacing(0.5)
    }
}))

interface MenuItem {
    name: string
    action: () => void | Promise<void>
}

export interface MenuProps {
    className?: string
    style?: CSSProperties
    menuItems: MenuItem[]
    targetNode: React.ReactNode
}

export const Menu: React.FC<MenuProps> = props => {
    const { targetNode, menuItems } = props
    const classes = useStyles()
    const [anchorEl, setAnchorEl] = React.useState<HTMLDivElement | undefined>()

    const menuItemUI = menuItems.map(menuItem => {
        const onClick = async () => {
            await menuItem.action()
            setAnchorEl(undefined)
        }
        return (
            <Btn key={menuItem.name} onClick={onClick} variant="text" className={classes.menuBtn}>
                {menuItem.name}
            </Btn>
        )
    })

    return (
        <React.Fragment>
            <div onClick={e => setAnchorEl(anchorEl ? undefined : e.currentTarget)}>{targetNode}</div>
            <Popover open={!!anchorEl} anchorEl={anchorEl}>
                <Column align="stretch">{menuItemUI}</Column>
            </Popover>
        </React.Fragment>
    )
}
