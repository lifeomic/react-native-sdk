module.exports = {
  root: true,
  extends: '@react-native-community',
  parserOptions: {
    requireConfigFile: false,
  },
  plugins: ['@lifeomic/i18next'],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        paths: ['src'],
        patterns: ['src/*'],
      },
    ],
    'no-alert': [
      'off',
      {
        paths: ['example/storybook'],
        patterns: ['example/storybook/*'],
      },
    ],
    'react-native/no-inline-styles': [
      'off',
      {
        paths: ['example/storybook'],
        patterns: ['example/storybook/*'],
      },
    ],
  },
};
