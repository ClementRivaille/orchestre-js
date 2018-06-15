var path = require('path');

var devConfig = {
     entry: ['babel-polyfill', './demo/index.js'],
     output: {
         filename: 'orchestre.js',
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

var buildConfig = {
     entry: ['babel-polyfill', './src/orchestre.js'],
     output: {
         filename: 'orchestre.min.js',
         library: 'Orchestre',
         libraryTarget: 'var',
         libraryExport: 'default',
         path: path.join(__dirname, 'dist')
     },
     target: 'web',
     mode: 'production',
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
     }
};

module.exports = process.env.ENV === 'development' ? devConfig : buildConfig;