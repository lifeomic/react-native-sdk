module.exports = {
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { diagnostics: false }],
  },
  testRunner: 'jest-circus/runner',
  testMatch: [
    '<rootDir>/src/**/*.test.{js,jsx,ts,tsx}',
  ],
  moduleNameMapper: {
    '\\.svg': '<rootDir>/__mocks__/svgMock.tsx',
  },
  moduleFileExtensions: ['js', 'json', 'ts', 'tsx', 'jsx', 'node', 'mjs'],
  modulePathIgnorePatterns: [
    '<rootDir>[/\\\\](|coverage|node_modules)[/\\\\]',
    'src/components/TrackTile/TrackerDetails/AdvancedTrackerEditor/AdvancedTrackerEditor.test.tsx',
  ],
  preset: 'react-native',
  setupFilesAfterEnv: [
    '@testing-library/jest-native/extend-expect',
    '<rootDir>/jest.setup.ts'
  ],
  clearMocks: true,
  collectCoverage: true,
  collectCoverageFrom: ['<rootDir>/src/**/*.{ts,tsx,js,jsx}', '!src/**/**/index.ts'],
  coveragePathIgnorePatterns: [
    'src/common/testID',
    'src/common/init',
    'src/common/RootProviders',
    'src/common/LoggedInProviders',
    'src/common/ThemedNavigationContainer',
    'src/navigators', 'src/components/TrackTile'
  ],
  coverageThreshold: {
    global: {
      branches: 75,
      statements: 75,
      functions: 75,
      lines: 75,
    },
  },
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?@?react-native|query-string|decode-uri-component|split-on-first|filter-obj)',
  ]
};
