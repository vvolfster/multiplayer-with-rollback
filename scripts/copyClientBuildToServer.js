const fs = require("fs-extra")
const path = require('path')

const PATHS = {
    FROM: path.resolve(__dirname, "../packages/client/build"),
    TO: path.resolve(__dirname, "../packages/server/dist/buildSite")
}

fs.copySync(PATHS.FROM, PATHS.TO, { overwrite: true, dereference: true })