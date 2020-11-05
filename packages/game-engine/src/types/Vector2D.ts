interface NumPair {
    x: number
    y: number
}

export class Vector2D {
    x: number
    y: number

    constructor(params?: NumPair | Vector2D) {
        if (!params) {
            this.x = 0
            this.y = 0
        } else {
            this.x = params.x
            this.y = params.y
        }
    }

    scale = (v: number) => {
        this.x *= v
        this.y *= v
        return this
    }

    add = (v: NumPair | Vector2D) => {
        this.x += v.x
        this.y += v.y
        return this
    }

    subtract = (v: NumPair | Vector2D) => {
        return this.add({ x: -v.x, y: -v.y })
    }

    clone = () => {
        return new Vector2D(this)
    }

    normalize = () => {
        if (this.x < 0) {
            this.x = -1
        } else if (this.x > 0) {
            this.x = 1
        }

        if (this.y < 0) {
            this.y = -1
        } else if (this.y > 0) {
            this.y = 1
        }

        return this
    }

    toJs = () => {
        return { x: this.x, y: this.y }
    }
}
