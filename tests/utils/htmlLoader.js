import htmlLoader from 'html-loader';

export default {
  process(src, filename, config, options) {
    return {
      code: `module.exports = ${JSON.stringify(src)};`,
    };
  },
};
