const path = require('path');

module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['../'],
        alias: {
          react: path.resolve(__dirname, './node_modules/react'),
          'react-native': path.resolve(
            __dirname,
            './node_modules/react-native'
          ),
          'react-query': path.resolve(
            __dirname,
            './node_modules/react-query'
          ),
          '@react-navigation/native': path.resolve(__dirname, './node_modules/@react-navigation/native'),
          '@react-navigation/native-stack': path.resolve(__dirname, './node_modules/@react-navigation/native-stack'),
          'react-native-safe-area-context': path.resolve(__dirname, './node_modules/react-native-safe-area-context'),
          src: '../src',
          lib: '../lib',
        }
      }
    ]
  ]
};
