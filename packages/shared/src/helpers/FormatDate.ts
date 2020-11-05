export function FormatDate(date: Date) {
    const dateStr = [date.getMonth() + 1, date.getDate(), date.getFullYear()].join("/")
    const timeStr = [date.toLocaleTimeString(), date.getMilliseconds(), "ms"].join(" ")
    return [dateStr, timeStr].join(" ")
}
