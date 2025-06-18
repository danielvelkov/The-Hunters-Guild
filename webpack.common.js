const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin'); // Extracts CSS into separate files
const CopyWebpackPlugin = require('copy-webpack-plugin'); // Copies files/directories to the build directory

module.exports = {
  // Entry points define where Webpack starts building the bundle
  // Each entry point will produce a separate output file
  entry: {
    'hunting-quest/index': [
      './src/public/js/common/common.js', // Common JS code shared across pages
      './src/public/js/hunting-quest/index.js', // Index page specific code
    ],
    'hunting-quest/create': [
      './src/public/js/common/common.js', // Common JS code shared across pages
      './src/public/js/hunting-quest/create.js', // Create page specific code
    ],
    'hunting-quest/show': [
      './src/public/js/common/common.js', // Common JS code shared across pages
      './src/public/js/hunting-quest/show.js', // Show page specific code
    ],
  },
  optimization: {
    usedExports: true, // ensures unused code is removed
  },
  performance: {
    assetFilter: function (assetFileName) {
      return !assetFileName.endsWith('.png');
    },
  },
  plugins: [
    // Automatically load jQuery as a global variable when $ or jQuery is encountered
    // This avoids needing to import jQuery in every file that uses it
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
    }),

    // Extract CSS into separate files, one per JavaScript entry point
    // This improves performance by allowing the browser to load CSS in parallel with JS
    new MiniCssExtractPlugin({
      // Optional: customize the output filename pattern
      // filename: '[name].css',
      // chunkFilename: '[id].css',
    }),

    // Copy static assets that don't need processing directly to the dist folder
    // This preserves the original file paths, making it easier to reference them in HTML/CSS
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'src/public/icons', // Source directory with icon files
          to: 'icons', // Destination directory in the dist folder
          noErrorOnMissing: true, // Optional: don't fail if directory doesn't exist
          // globOptions: { ignore: ['**/*.txt'] },  // Optional: exclude certain files
        },
        { from: 'src/public/favicon.ico' },
        // You can add more patterns here to copy additional directories:
        // { from: 'src/public/images', to: 'images' },
        // { from: 'src/public/fonts', to: 'fonts' },
      ],
    }),
  ],
  resolve: {
    // Aliases provide shortcuts for import paths
    // Instead of '../../../../css/some-file.css', you can use 'css/some-file.css'
    alias: {
      css: path.resolve(__dirname, 'src/public/css'),
      js: path.resolve(__dirname, 'src/public/js'),
      icons: path.resolve(__dirname, 'src/public/icons'),
      entities: path.resolve(__dirname, 'src/entities'),
    },
  },

  // Output configuration specifies how and where to store compiled files
  output: {
    path: path.resolve(__dirname, 'dist'), // Target directory for all output files
    filename: '[name].js', // Naming pattern for output files (based on entry keys)
    clean: true, // Clean the output directory before each build
    publicPath: '/', // Base path for all assets, used in generated URLs
  },
  module: {
    rules: [
      {
        test: /\.(?:js|mjs|cjs)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader', // Use Babel for transpilation
          options: {
            targets: 'defaults', // Target default browsers
            presets: [
              ['@babel/preset-env', { targets: { node: 'current' } }], // Use preset-env with Node.js targets
            ],
            plugins: [
              ['@babel/plugin-proposal-decorators', { legacy: true }], // Support legacy decorator syntax
            ],
          },
        },
      },
      {
        test: /\.css$/i,
        use: [
          MiniCssExtractPlugin.loader, // Extract CSS to separate files
          'css-loader', // Process @import, url() etc. in CSS
        ],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource', // Emit a separate file and export the URL
        generator: {
          filename: 'images/[hash][ext][query]', // Output pattern with content hash for cache busting
        },
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i, // Match font file extensions
        type: 'asset/resource', // Emit a separate file and export the URL
        generator: {
          filename: 'fonts/[hash][ext][query]', // Output pattern with content hash
        },
      },
    ],
  },
};
