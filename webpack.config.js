var path = require("path");

var devConfig = {
  entry: ["babel-polyfill", "./demo/index.js"],
  output: {
    filename: "orchestre.js"
  },
  mode: "development",
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/
      },
      {
        test: /\.js$/,
        loader: "babel-loader",
        options: {
          presets: ["es2015", "stage-0"]
        }
      }
    ]
  },
  resolve: {
    extensions: [".ts", ".js", ".json"]
  },
  devtool: "source-map",
  devServer: {
    contentBase: path.join(__dirname, "demo")
  }
};

var buildConfig = {
  entry: {
    Orchestre: ["babel-polyfill","./src/index.ts"]
  },
  devtool: "source-map",
  output: {
    filename: "[name].js",
    library: "OrchestreJs",
    libraryTarget: "umd",
    path: path.join(__dirname, "dist")
  },
  target: "web",
  mode: "production",
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [{
          loader: "ts-loader",
          options: {
            compilerOptions: {
              declaration: false,
              sourceMap: false
            }
          }
        }],  
        exclude: /node_modules/,
        
      },
      {
        test: /\.js$/,
        loader: "babel-loader",
        options: {
          presets: ["es2015", "stage-0"]
        }
      }
    ]
  },
  resolve: {
    extensions: [".ts", ".js", ".json"]
  }
};

module.exports = process.env.ENV === "development" ? devConfig : buildConfig;
