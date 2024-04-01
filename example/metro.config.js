const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const {
  resolver: { sourceExts, assetExts },
} = getDefaultConfig(__dirname);

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */

const config = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  },
  resolver: {
    assetExts: assetExts.filter(ext => ext !== 'svg'),
    sourceExts: [...sourceExts, 'svg'],
  },
  watchFolders: [
    path.resolve(__dirname, '../src'),
    path.resolve(__dirname, '../lib'),
    path.resolve(__dirname, '../node_modules')
  ],
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);