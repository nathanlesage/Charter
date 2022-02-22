import { VueLoaderPlugin } from 'vue-loader'
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin'
import HTMLWebpackPlugin from 'html-webpack-plugin'
import webpack from 'webpack'
const { DefinePlugin } = webpack
// import { DefinePlugin } from 'webpack'

export default {
  entry: {
    app: './src/main.ts'
  },
  mode: (process.env.NODE_ENV === 'production') ? 'production' : 'development',
  devtool: (process.env.NODE_ENV === 'production') ? false : 'source-map',
  devServer: {
    hot: true,
    port: 8080
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /(node_modules|\.webpack)/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
            appendTsSuffixTo: [/\.vue$/] // Enable ts support in Vue SFCs
          }
        }
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        // Handle font files: just copy them
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: {
          loader: 'file-loader',
          options: {
            // Do not wrap in js module
            esModule: false,
            name: '[path][name].[ext]'
          }
        }
      },
      {
        test: /\.css$/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' }
        ]
      }
    ]
  },
  plugins: [
    // Enhanced typescript support (e.g. moves typescript type checking to separate process)
    new ForkTsCheckerWebpackPlugin(),

    // Apply webpack rules to the corresponding language blocks in .vue files
    new VueLoaderPlugin(),

    // Set a few Vue 3 options; see: http://link.vuejs.org/feature-flags
    new DefinePlugin({
      __VUE_OPTIONS_API__: true,
      __VUE_PROD_DEVTOOLS__: process.env.NODE_ENV !== 'production'
    }),

    new HTMLWebpackPlugin({
      template: './src/index.htm',
      scriptLoading: 'defer'
    })
  ],
  resolve: {
    extensions: [ '.js', '.ts', '.vue', '.css' ]
  }
};
