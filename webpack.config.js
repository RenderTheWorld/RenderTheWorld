const path = require('path');

module.exports = {
  mode: 'none', // 禁用所有默认优化
  entry: './src/index.js',
  output: {
    filename: 'index.global.js', // 单文件输出
    path: path.resolve(__dirname, 'dist'),
  },
  devtool: false, // 禁用 Source Map
  optimization: {
    minimize: false, // 禁用代码压缩
    concatenateModules: true, // 将模块合并到同一个作用域中，避免生成 __webpack_require__
  },
  module: {
    rules: [
      {
        test: /\.js$/, // 匹配所有 .js 文件
        use: {
          loader: 'babel-loader', // 使用 babel-loader
          options: {
            presets: [
              [
                '@babel/preset-env',
                {
                  targets: {
                    chrome: '58', // 目标环境为 Chrome 58+
                    node: '12',   // 目标环境为 Node.js 12+
                  },
                },
              ],
            ],
            comments: true, // 保留注释
          },
        },
      },
    ],
  },
};