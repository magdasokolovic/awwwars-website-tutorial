const path = require('path')

const { merge } = require('webpack-merge')
const config = require('./webpack.config')

module.exports = merge(config, {
  node: 'production',
  output: {
    path: path.join(__dirname, 'public')
  }
})
