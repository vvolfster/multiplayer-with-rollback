import CircularProgress from "@material-ui/core/CircularProgress"
import { Redirect, RouteComponentProps } from "@reach/router"
import { getQueryParams } from "helpers/getQueryParams"
import { pickBy } from "lodash"
import React, { useEffect, useState } from "react"

interface RouteProps extends RouteComponentProps {
    component: React.ComponentType<RouteComponentProps<{}>>
    redirect?: string
    guard?: (to: RouteInfo, from?: RouteInfo) => Promise<boolean | string>
}

enum STATUS {
    LOADING,
    REDIRECT,
    READY,
    ERROR
}

interface Params {
    [key: string]: {}
}

export interface RouteInfo {
    path?: string
    fullPath?: string
    parameters: Partial<RouteProps>
    query: Params
}

const helpers = {
    previousRouteInfo: undefined as RouteInfo | undefined,
    getParameters(props: RouteProps): Partial<RouteProps> {
        const removeKeys = ["component", "default", "guard", "location", "name", "navigate", "path", "redirect", "uri", "children", "*"]
        return pickBy(props, (v, k) => !removeKeys.includes(k))
    },
    getQuery(url: string = ""): Params {
        return getQueryParams(url)
    },
    pageProps(props: RouteProps) {
        const removeKeys = [`component`, `redirect`, `guard`]
        return pickBy(props, (v, k) => !removeKeys.includes(k))
    },
    getRouteInfo(props: RouteProps): RouteInfo {
        return {
            path: props.path,
            fullPath: props.location && props.location.pathname,
            parameters: helpers.getParameters(props),
            query: helpers.getQuery(window.location.href)
        }
    }
}

export const Route: React.FC<RouteProps> = props => {
    const [status, setStatus] = useState(STATUS.LOADING)
    const [redirect, setRedirect] = useState(props.redirect || "/login")

    useEffect(() => {
        const onGuard = async () => {
            const routeInfo = helpers.getRouteInfo(props)
            const toReady = () => {
                helpers.previousRouteInfo = routeInfo
                return setStatus(STATUS.READY)
            }
            const toRedirect = (newRedirect?: string) => {
                if (newRedirect) {
                    setRedirect(newRedirect)
                }
                return setStatus(STATUS.REDIRECT)
            }

            if (!props.guard) {
                helpers.previousRouteInfo = routeInfo
                return toReady()
            }

            try {
                const result = await props.guard(routeInfo, helpers.previousRouteInfo)
                if (typeof result === "boolean") {
                    const r = result as boolean
                    return r ? toReady() : toRedirect()
                }

                const r = result as string
                return r.length ? toRedirect(r) : setStatus(STATUS.ERROR)
            } catch (e) {
                console.error(`Error in guard function`, e)
                return setStatus(STATUS.ERROR)
            }
        }
        onGuard()
    }, [props])

    switch (status) {
        default:
            return null // error case
        case STATUS.LOADING:
            return <CircularProgress />
        case STATUS.REDIRECT:
            return <Redirect noThrow to={redirect} />
        case STATUS.READY:
            return <props.component {...helpers.pageProps(props)} />
    }
}
