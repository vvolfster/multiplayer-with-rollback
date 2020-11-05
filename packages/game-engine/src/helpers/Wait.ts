export function Wait(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

export function WaitUntil(truthyFn: () => boolean, interval = 250, maxWait?: number) {
    return new Promise((resolve, reject) => {
        let timeElapsed = 0

        const loop = () => {
            if (maxWait && timeElapsed > maxWait) {
                return reject(`Max wait of ${maxWait} ms elapsed`)
            }

            if (truthyFn()) {
                resolve()
            } else {
                timeElapsed += interval
                setTimeout(loop, interval)
            }
        }

        loop()
    })
}
