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
          '@tanstack/react-query': path.resolve(
            __dirname,
            './node_modules/@tanstack/react-query'
          ),
          '@react-navigation/native': path.resolve(__dirname, './node_modules/@react-navigation/native'),
          '@react-navigation/native-stack': path.resolve(__dirname, './node_modules/@react-navigation/native-stack'),
          '@react-navigation/bottom-tabs': path.resolve(__dirname, './node_modules/@react-navigation/bottom-tabs'),
          'react-native-safe-area-context': path.resolve(__dirname, './node_modules/react-native-safe-area-context'),
          'react-native-screens': path.resolve(__dirname, './node_modules/react-native-screens'),
          'react-native-svg': path.resolve(__dirname, './node_modules/react-native-svg'),
          'react-native-toast-message': path.resolve(__dirname, './node_modules/react-native-toast-message'),
          '@react-native-community/netinfo': path.resolve(__dirname, './node_modules/@react-native-community/netinfo'),
          '@react-native-async-storage/async-storage': path.resolve(__dirname, './node_modules/@react-native-async-storage/async-storage'),
          'graphql-request': path.resolve(
            __dirname, 
            './node_modules/graphql-request'
          ),
          src: '../src',
          lib: '../lib',
        }
      }
    ],
    [
      'react-native-reanimated/plugin'
    ],
  ]
};
