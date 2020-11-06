import React from "react"
import { Route } from "./Route"
import { capitalize, every, find, keys, toLower, values } from "lodash"
import { Router, Redirect } from "@reach/router"
import { Home } from "pages/Home"
import { OnePlayer } from "pages/OnePlayer"
import { Multiplayer } from "pages/Multiplayer"

interface RouterProps {
    className?: string
    style?: React.CSSProperties
}

export const PATHS = {
    INDEX: () => "/",
    HOME: () => "/home",
    ONE_PLAYER: () => "/one-player",
    MULTI_PLAYER: () => "/multiplayer"
}

export function getPageName(PATH: string) {
    const path = PATH.startsWith("/") ? PATH.slice(1) : PATH
    const pieces = path.split("/")

    const pathNames = keys(PATHS)
    const pathValues = values(PATHS)
        .map(fn => fn())
        .map(p => (p.startsWith("/") ? p.slice(1) : p))

    const matchingPathName = find(pathNames, (name: string, idx: number) => {
        const pathPieces = pathValues[idx]?.split("/")
        return every(pieces, (piece: string, pieceIdx: number) => {
            const pathPiece = pathPieces[pieceIdx]
            if (!pathPiece) {
                return false
            }

            if (pathPiece.startsWith(":")) {
                return true
            }

            return piece === pathPiece
        })
    })

    if (!matchingPathName) {
        return "Game"
    }

    return matchingPathName.split("_").map(toLower).map(capitalize).join(" ")
}

const RedirectToHome: React.FC = () => <Redirect to={PATHS.HOME()} noThrow />

const Main: React.FC<RouterProps> = props => (
    <Router className={props.className} style={props.style}>
        <Route path={PATHS.INDEX()} component={RedirectToHome} />
        <Route path={PATHS.HOME()} component={Home} />
        <Route path={PATHS.ONE_PLAYER()} component={OnePlayer} />
        <Route path={PATHS.MULTI_PLAYER()} component={Multiplayer} />
    </Router>
)

export const AppRouter = { Main }
