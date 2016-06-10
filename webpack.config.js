module.exports = {
    entry: "./src/index.js",
    output: {
        path: "dist",
        filename: "stargate.webpack.js",
        libraryTarget: "umd",
        library: "Stargate"
    }
}