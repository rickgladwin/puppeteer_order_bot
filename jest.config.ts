// jest configuration for backend

/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    // test ts files only (not their js equivalents)
    testRegex: [
        "\\/*\\.(spec|test)\\.ts",
    ],
    testPathIgnorePatterns: [
        "/node_modules/",
    ],
    transform: {
        "^.+\\.jsx?$": "babel-jest",
    },
}
