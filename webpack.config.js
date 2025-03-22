const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'index.min.js', // 你可以将文件名改为 .min.js 以表示这是压缩后的文件
    path: path.resolve(__dirname, 'dist'),
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
  mode: 'production', // 设置为 production 模式会自动启用压缩
};