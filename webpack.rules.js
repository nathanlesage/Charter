module.exports = [{
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
]
