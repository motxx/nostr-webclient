const path = require('path')

module.exports = {
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    configure: (webpackConfig) => {
      webpackConfig.devtool = false

      const newRules = webpackConfig.module.rules.map((rule) => {
        if (
          rule.enforce === 'pre' &&
          rule.loader &&
          rule.loader.includes('source-map-loader')
        ) {
          return {
            ...rule,
            exclude: /node_modules/,
          }
        }
        return rule
      })

      webpackConfig.module.rules = newRules

      return webpackConfig
    },
  },
}
