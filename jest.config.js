const config = {
  // Automatically clear mock calls, instances, contexts and results before every test
  clearMocks: true,

  // The test environment that will be used for testing
  testEnvironment: 'jsdom',

  // The glob patterns Jest uses to detect test files
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[tj]s?(x)'],
  setupFiles: ['<rootDir>/tests/jest.setup.js'],

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@models/(.*)$': '<rootDir>/src/models/$1',
    '^js/(.*)$': '<rootDir>/src/public/js/$1',
    '^css/(.*)$': '<rootDir>/tests/__mocks__/styleMock.js', // mock all css imports
    '@tests/(.*)$': '<rootDir>/tests/$1',
    '^entities/(.*)$': '<rootDir>/src/entities/$1',
  },
  // If using subpath imports
  resolver: undefined, // Jest handles subpath imports automatically in newer versions
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
};

export default config;
