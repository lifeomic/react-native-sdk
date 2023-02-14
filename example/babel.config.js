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
          'src/common/img': path.resolve(__dirname, './storybook/img'),
          src: '../src',
          lib: '../lib',
        }
      }
    ]
  ]
};