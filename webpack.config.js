const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: path.join(__dirname, "src", "index.tsx"),
  mode: "development",
  output: {
    path: path.resolve(__dirname, "dist/app"),
  },
  module: {
    rules: [
      {
        test: /\.(js|ts)x?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react", "@babel/preset-typescript"]
          }
        }
      },
      {
        test:/\.css$/,
        use:["style-loader","css-loader"]
      },
      {
        test:/\.(ico|png|svg|jpg|gif)$/,
        use:["file-loader"]
      },
      {
        test: /\.(m?js)$/,
        resolve: {
          fullySpecified: false,
        },
        use: ["source-map-loader"]
      }
    ]
  },
  resolve: {
    modules: [__dirname, "src", "node_modules"],
    extensions: [".*", ".js", ".jsx", ".tsx", ".ts"]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "public", "index.html"),
    }),
  ],
}