module.exports = {
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testRunner: 'jest-circus/runner',
  testMatch: [
    '<rootDir>/src/**/*.test.{js,jsx,ts,tsx}',
  ],
  moduleFileExtensions: ['js', 'json', 'ts', 'tsx', 'jsx', 'node', 'mjs'],
  modulePathIgnorePatterns: ['<rootDir>[/\\\\](|coverage|node_modules)[/\\\\]'],
  preset: 'react-native',
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  clearMocks: true,
  collectCoverage: true,
  collectCoverageFrom: ['<rootDir>/src/**/*.{ts,tsx,js,jsx}'],
  coverageThreshold: {
    global: {
      branches: 75,
      statements: 75,
      functions: 75,
      lines: 75,
    },
  },
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?@?react-native)'
  ]
};
