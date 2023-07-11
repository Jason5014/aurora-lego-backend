/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FilemanagerWebpackPlugin = require('filemanager-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const buildPath = path.join(__dirname, '../app/public');
const templatePath = path.join(__dirname, '../app/view');

module.exports = env => {
  const isProduction = !!env.production;
  return {
    mode: 'production',
    context: path.resolve(__dirname, '../webpack'),
    entry: './index.js',
    output: {
      path: buildPath,
      filename: 'bundle.[hash:6].js',
      publicPath: isProduction ? 'http://aurora-backend.oss-cn-shanghai.aliyuncs.cn/h5-assets/' : '/public/',
    },
    module: {
      rules: [
        {
          test: /\.css$/,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
          ],
        },
      ],
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: '[name].[hash:6].css',
      }),
      new HtmlWebpackPlugin({
        filename: 'page.nj',
        template: path.resolve(__dirname, 'template.html'),
      }),
      new FilemanagerWebpackPlugin({
        events: {
          onEnd: {
            copy: [
              {
                source: path.join(buildPath, 'page.nj'),
                destination: path.join(templatePath, 'page.nj'),
              },
            ],
          },
        },
      }),
      new CleanWebpackPlugin(),
    ],
  };
};
