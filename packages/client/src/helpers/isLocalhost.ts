export function isLocalhost() {
    const { hostname } = window.location
    return hostname.startsWith("localhost") || hostname.startsWith("192") || hostname.startsWith("127")
}
