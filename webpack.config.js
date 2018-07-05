module.exports = {
     entry: ['babel-polyfill', './index.js'],
     output: {
         filename: 'bundle.js',
         path: __dirname
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
};
