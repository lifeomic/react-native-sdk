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
          '@react-navigation/bottom-tabs': path.resolve(__dirname, './node_modules/@react-navigation/bottom-tabs'),
          'react-native-safe-area-context': path.resolve(__dirname, './node_modules/react-native-safe-area-context'),
          'react-native-screens': path.resolve(__dirname, './node_modules/react-native-screens'),
          src: '../src',
          lib: '../lib',
        }
      }
    ]
  ]
};
