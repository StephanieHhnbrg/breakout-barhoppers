const webpack = require('webpack');

module.exports = {
  resolve: {
    fallback: {
      stream: require.resolve('stream-browserify'),
      crypto: require.resolve("crypto-browserify"),
      buffer: require.resolve('buffer/'),
      process: require.resolve('process/browser'),
      vm: require.resolve("vm-browserify")
    },
  },
  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser',
    }),
  ],
};
