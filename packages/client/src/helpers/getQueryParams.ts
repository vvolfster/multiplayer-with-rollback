export interface Params {
    [key: string]: string
}

export const getQueryParams = (url: string = ""): Params => {
    const query: Params = {}
    url.replace(/[?&]+([^=&]+)=([^&]*)/gi, (substring, key, value) => {
        return (query[key] = value)
    })
    return query
}
