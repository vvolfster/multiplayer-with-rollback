const fs = require("fs-extra")
const path = require('path')

const PATHS = {
    FROM: path.resolve(__dirname, "../packages/client/build"),
    TO: path.resolve(__dirname, "../packages/server/build/buildSite")
}

fs.copySync(PATHS.FROM, PATHS.TO, { overwrite: !keepExisingInDest, dereference: true })