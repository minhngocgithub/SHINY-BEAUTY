module.exports = {
    // Test environment
    testEnvironment: 'node',

    // Roots for test discovery
    roots: ['<rootDir>/tests'],

    // Test match patterns
    testMatch: [
        '**/__tests__/**/*.test.js',
        '**/?(*.)+(spec|test).js'
    ],

    // Coverage configuration
    collectCoverage: true,
    coverageDirectory: '<rootDir>/coverage',
    collectCoverageFrom: [
        'controller/**/*.js',
        'services/**/*.js',
        'middleware/**/*.js',
        'models/**/*.js',
        'utils/**/*.js',
        '!**/node_modules/**',
        '!**/tests/**',
        '!**/coverage/**',
        '!**/uploads/**',
        '!**/logs/**'
    ],

    // Coverage thresholds (target >70%)
    coverageThreshold: {
        global: {
            branches: 70,
            functions: 70,
            lines: 70,
            statements: 70
        }
    },

    // Coverage reporters
    coverageReporters: [
        'text',
        'text-summary',
        'html',
        'lcov',
        'json'
    ],

    // Setup files
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

    // Test timeout (30 seconds for integration tests)
    testTimeout: 30000,

    // Clear mocks between tests
    clearMocks: true,
    resetMocks: true,
    restoreMocks: true,

    // Verbose output
    verbose: true,

    // Transform files
    transform: {},

    // Module paths
    moduleDirectories: ['node_modules', '<rootDir>'],

    // Force exit after tests complete
    forceExit: true,

    // Detect open handles
    detectOpenHandles: true,

    // Max workers for parallel testing
    maxWorkers: '50%',

    // Global setup and teardown
    globalSetup: '<rootDir>/tests/globalSetup.js',
    globalTeardown: '<rootDir>/tests/globalTeardown.js'
};
