const path = require('path');

module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  },
  watchFolders: [
    path.resolve(__dirname, '../src'),
    path.resolve(__dirname, '../lib'),
    path.resolve(__dirname, '../node_modules')
  ],
};
