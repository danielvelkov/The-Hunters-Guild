const path = require('path');

module.exports = {
  entry: {
    'hunting-quest/index': [
      './src/public/js/common/common.js',
      './src/public/js/hunting-quest/index.js',
    ],
    'hunting-quest/create': [
      './src/public/js/common/common.js',
      './src/public/js/hunting-quest/index.js',
    ],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js', // Bundles will be named based on entry keys (e.g., hunting-quest/index.js)
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.(?:js|mjs|cjs)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            targets: 'defaults',
            presets: [['@babel/preset-env', { targets: { node: 'current' } }]],
            plugins: [['@babel/plugin-proposal-decorators', { legacy: true }]],
          },
        },
      },
    ],
  },
};
