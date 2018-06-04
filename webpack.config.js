var path = require('path');

 module.exports = {
     entry: ['babel-polyfill', './demo/index.js'],
     output: {
         filename: 'bundle.js'
     },
     mode: 'development',
     module: {
         rules: [
             {
                 test: /\.js$/,
                 loader: 'babel-loader',
                 options: {
                     presets: ['es2015', 'stage-0']
                 }
             }
         ]
     },
     devtool: 'source-map',
     devServer: {
        contentBase: path.join(__dirname, 'demo')
     }
};