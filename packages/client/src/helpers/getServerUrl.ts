import { isNgrok } from "./isNgrok"
import { isLocalhost } from "./isLocalhost"

const NGROK_SERVER_URL = "multiplayer-w-rollback-server.ngrok.io"

export function getServerPort() {
    if (isLocalhost()) {
        return 5000
    }
    return 80
}

export function getServerUrl() {
    if (isNgrok()) {
        return `${window.location.protocol}://${NGROK_SERVER_URL}`
    }

    const port = getServerPort()
    return `${window.location.protocol}://${window.location.hostname}:${port}`
}

export function getWsUrl() {
    if (isNgrok()) {
        return NGROK_SERVER_URL
    }

    const port = getServerPort()
    return port === 80 ? window.location.hostname : `${window.location.hostname}:${port}`
}
