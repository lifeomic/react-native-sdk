module.exports = {
  root: true,
  extends: '@react-native-community',
  parserOptions: {
    requireConfigFile: false,
  },
  plugins: ['@lifeomic/i18next'],
  rules: {
    "no-restricted-imports": ["error", {
      "paths": ['src'],
      "patterns": ['src/*']
    }]
  }
};
