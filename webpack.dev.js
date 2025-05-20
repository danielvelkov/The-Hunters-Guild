require('dotenv').config();
const path = require('path');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const { PORT } = process.env;

/**
 * DEVELOPMENT WEBPACK CONFIG:
 * Configures webpack-dev-server to run on port 8080 and proxy all requests to your Express server running on port 3000
 * 
 * This means:
 *  - webpack-dev-server handles frontend assets (JS, CSS)
 *  - All other requests (routes, API calls) are forwarded to the Express server
 *  - Hot Module Replacement (HMR) will work properly for frontend change
 */
module.exports = merge(common, {
  mode: 'development',
  devtool: 'eval-source-map',
  devServer: {
    allowedHosts: 'all',
    watchFiles: './src/**/*.ejs',
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    proxy: [
      {
        port: 8080,
        context: ['**'], // '**' matches all paths
        target: `http://localhost:${PORT}`,
      },
    ],
  },
});
