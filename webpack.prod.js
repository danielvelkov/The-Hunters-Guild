import { merge } from 'webpack-merge';
import common from './webpack.common.js';
import CompressionPlugin from 'compression-webpack-plugin';

export default merge(common, {
  mode: 'production',
  devtool: 'source-map',
  plugins: [
    new CompressionPlugin({
      algorithm: 'gzip',
      test: /\.(js|css|html)$/,
    }),
  ],
});
