// { targets: { node: 'current' } } ensures Babel transpiles JavaScript for the currently installed Node.js version.
// This means it won’t include polyfills or transforms for older Node.js versions that your current setup doesn't need.
module.exports = {
  presets: [['@babel/preset-env', { targets: { node: 'current' } }]],
};
