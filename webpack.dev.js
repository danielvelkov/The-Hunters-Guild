import 'dotenv/config';
import path from 'path';
import { merge } from 'webpack-merge';
import common from './webpack.common.js';
const { PORT } = process.env;
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


/**
 * DEVELOPMENT WEBPACK CONFIG:
 * Configures webpack-dev-server to run on port 8080 and proxy all requests to your Express server running on port 3000
 *
 * This means:
 *  - webpack-dev-server handles frontend assets (JS, CSS)
 *  - All other requests (routes, API calls) are forwarded to the Express server
 *  - Hot Module Replacement (HMR) will work properly for frontend change
 *
 * Another added thing is a 'source map' tool so that any error messages reference files and
 * lines from our development code and not the jumbled mess inside our single bundled .js file
 */
export default merge(common, {
  mode: 'development',
  devtool: 'eval-source-map',
  devServer: {
    allowedHosts: 'all',
    watchFiles: './src/**/*',
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
