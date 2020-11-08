export function isNgrok() {
    const { hostname } = window.location
    return hostname.includes("ngrok.io")
}
