module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    moduleFileExtensions: ["js", "json", "ts"],
    testRegex: ".*\\.spec\\.ts$",
    transform: {
        "^.+\\.(t|j)s$": [
            "ts-jest",
            {
                tsconfig: "tsconfig.spec.json"
            }
        ],
    },
    collectCoverage: true,
    coverageDirectory: "./coverage",
    collectCoverageFrom: [
        "src/**/*.{ts,js}",
        "!src/**/*.module.ts",
        "!src/main.ts",
    ]
};
