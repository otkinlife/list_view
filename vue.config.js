const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  transpileDependencies: true,
  productionSourceMap: true, // 生成生产环境的 Source Map
  configureWebpack: {
    devtool: 'source-map', // 为开发环境生成 Source Map
  },
});