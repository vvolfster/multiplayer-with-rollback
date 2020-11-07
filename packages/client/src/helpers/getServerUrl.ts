import { isLocalhost } from "./isLocalhost"

export function getServerPort() {
    if (isLocalhost()) {
        return 5000
    }
    return 80
}

export function getServerUrl() {
    const port = getServerPort()
    return `${window.location.protocol}://${window.location.hostname}:${port}`
}

export function getWsUrl() {
    const port = getServerPort()
    return port === 80 ? window.location.hostname : `${window.location.hostname}:${port}`
}
