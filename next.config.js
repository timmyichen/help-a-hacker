const withTs = require('@zeit/next-typescript');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const withCSS = require('@zeit/next-css');
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

// https://github.com/zeit/next-plugins/issues/541
function HACK_removeMinimizeOptionFromCssLoaders(config) {
  console.warn(
    'HACK: Removing `minimize` option from `css-loader` entries in Webpack config',
  );
  config.module.rules.forEach(rule => {
    if (Array.isArray(rule.use)) {
      rule.use.forEach(u => {
        if (u.loader === 'css-loader' && u.options) {
          delete u.options.minimize;
        }
      });
    }
  });
}

module.exports = withCSS(
  withTs({
    webpack(config, options) {
      HACK_removeMinimizeOptionFromCssLoaders(config);
      config.resolve.alias.client = './client';
      config.resolve.alias.server = './server';
      config.module.rules.push({
        test: /\.css/i,
        use: ['style-loader', 'css-loader'],
      });
      config.plugins.push(new ForkTsCheckerWebpackPlugin());
      // config.plugins.push(new BundleAnalyzerPlugin({ analyzerMode: 'static' }));
      return config;
    },
  }),
);
