const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  target: 'web',
  entry: {
    index: './src/index/index.js',
    courses: './src/courses/courses.js',
    about: './src/about/about.js',
    arithmetic: './src/uoar1/arithmetic/arithmetic.js',
    converter: './src/uoar1/converter/converter.js',
    error_correction: './src/uoar1/error_correction/error_correction.js',
    ieee754: './src/uoar1/ieee754/ieee754.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/[name].bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.(css|scss)$/,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          "sass-loader"
        ]
      }
    ]
  },
  devServer: {
    port: 8080
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: 'src/index/index.html',
      inject: true,
      chunks: ['index'],
      filename: 'index.html'
    }),
    new HtmlWebpackPlugin({
      template: 'src/courses/courses.html',
      inject: true,
      chunks: ['courses'],
      filename: 'courses.html'
    }),
    new HtmlWebpackPlugin({
      template: 'src/about/about.html',
      inject: true,
      chunks: ['about'],
      filename: 'about.html'
    }),
    new HtmlWebpackPlugin({
      template: 'src/uoar1/arithmetic/arithmetic.html',
      inject: true,
      chunks: ['arithmetic'],
      filename: 'uoar1/arithmetic.html'
    }),
    new HtmlWebpackPlugin({
      template: 'src/uoar1/converter/converter.html',
      inject: true,
      chunks: ['converter'],
      filename: 'uoar1/converter.html'
    }),
    new HtmlWebpackPlugin({
      template: 'src/uoar1/error_correction/error_correction.html',
      inject: true,
      chunks: ['error_correction'],
      filename: 'uoar1/error_correction.html'
    }),
    new HtmlWebpackPlugin({
      template: 'src/uoar1/ieee754/ieee754.html',
      inject: true,
      chunks: ['ieee754'],
      filename: 'uoar1/ieee754.html'
    }),
    new MiniCssExtractPlugin({
      filename: 'css/[name].css',
      chunkFilename: '[id].css',
    }),
    new CopyWebpackPlugin([
      { from: 'src/images', to: 'images' }
    ])
  ]
};