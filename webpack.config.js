import { VueLoaderPlugin } from 'vue-loader'
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin'
import HTMLWebpackPlugin from 'html-webpack-plugin'

export default {
  entry: {
    app: './src/main.ts'
  },
  devServer: {
    contentBase: './dist',
    port: 8080,
    publicPath: "/"
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /(node_modules|\.webpack)/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true
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

    new HTMLWebpackPlugin({
      template: './src/index.htm',
      scriptLoading: 'defer'
    })
  ],
  resolve: {
    extensions: [ '.js', '.ts', '.vue', '.css' ]
  }
};
