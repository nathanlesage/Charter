const path = require('path')
const rules = require('./webpack.rules')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const HTMLWebpackPlugin = require('html-webpack-plugin')

rules.push({
  test: /\.css$/,
  use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
});

module.exports = {
  entry: {
    app: path.resolve(__dirname, './src/renderer.ts')
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    port: 8080,
    publicPath: "/"
  },
  module: {
    rules
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
