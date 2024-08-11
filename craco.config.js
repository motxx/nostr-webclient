const { whenProd } = require('@craco/craco')
const webpack = require('webpack')
const path = require('path')

module.exports = {
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    configure: (webpackConfig, { env, paths }) => {
      if (env === 'development') {
        webpackConfig.devtool = 'eval-cheap-module-source-map'
      }

      webpackConfig.resolve.plugins = webpackConfig.resolve.plugins.filter(
        (plugin) => plugin.constructor.name !== 'ModuleScopePlugin'
      )

      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        assert: require.resolve('assert'),
        buffer: require.resolve('buffer'),
        process: require.resolve('process/browser'),
        vm: require.resolve('vm-browserify'),
      }

      webpackConfig.plugins = [
        ...(webpackConfig.plugins || []),
        new webpack.ProvidePlugin({
          process: 'process/browser',
          Buffer: ['buffer', 'Buffer'],
        }),
        new webpack.NormalModuleReplacementPlugin(/node:/, (resource) => {
          const mod = resource.request.replace(/^node:/, '')
          switch (mod) {
            case 'buffer':
              resource.request = 'buffer'
              break
            case 'stream':
              resource.request = 'readable-stream'
              break
            default:
              throw new Error(`Not found ${mod}`)
          }
        }),
      ]

      const sourceMapLoaderConfig = {
        test: /\.(js|mjs|jsx|ts|tsx)$/,
        use: {
          loader: 'source-map-loader',
          options: {
            filterSourceMappingUrl: (url, resourcePath) => false,
          },
        },
        enforce: 'pre',
      }

      webpackConfig.module.rules.push({
        ...sourceMapLoaderConfig,
        include: path.resolve(__dirname, 'node_modules/@nostr-dev-kit'),
        use: {
          ...sourceMapLoaderConfig.use,
          options: {
            filterSourceMappingUrl: (url, resourcePath) => {
              return !resourcePath.includes('@nostr-dev-kit/ndk')
            },
          },
        },
      })

      webpackConfig.module.rules.push({
        ...sourceMapLoaderConfig,
        include: [
          path.resolve(__dirname, 'node_modules/tseep'),
          path.resolve(__dirname, 'node_modules/@scure/base'),
        ],
      })

      webpackConfig.module.rules.push({
        test: /\.m?js/,
        resolve: {
          fullySpecified: false,
        },
      })

      return webpackConfig
    },
  },
  babel: {
    presets: [],
    plugins: [...whenProd(() => ['transform-remove-console'], [])],
  },
}
