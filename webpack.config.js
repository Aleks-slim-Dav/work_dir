const path = require("path");
const os = require("os");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const OptimizeCssAssetWebpackPlugin = require("optimize-css-assets-webpack-plugin");
const TerserWebpackPlugin = require("terser-webpack-plugin");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const DashboardPlugin = require("webpack-dashboard/plugin");
const ImageminPlugin = require("imagemin-webpack-plugin").default;

let mode = "development";
let target = "web";

const isDev = process.env.NODE_ENV === "development";
const isProd = !isDev;
console.log("IS DEV:", isDev);
console.log("IS PROD:", isProd);

const optimization = () => {
  const config = {
    splitChunks: {
      chunks: "all",
    },
  };
  if (isProd) {
    config.minimizer = [
      new OptimizeCssAssetWebpackPlugin(),
      new TerserWebpackPlugin({
        parallel: true,
        extractComments: false,
      }),
    ];
  }
  return config;
};

if (process.env.NODE_ENV === "production") {
  mode = "production";
  target = "browserslist";
}

const filename = (ext) => (isDev ? `[name].${ext}` : `[name].${ext}`);

const cssLoaders = (extra) => {
  const loaders = [
    {
      loader: MiniCssExtractPlugin.loader,
      options: {
        publicPath: "",
      },
    },
    "css-loader",
    "sass-loader",
  ];

  if (extra) {
    loaders.push(extra);
  }

  return loaders;
};

const plugins = () => {
  const base = [
    new HtmlWebpackPlugin({
      template: "./src/index.pug",
      minify: {
        collapseWhitespace: isProd, // убрать отступы
        removeComments: isProd, // убрать комментарии
      },
    }),
    // new HtmlWebpackPlugin({ // Создает экземпляр 1 стр. 1 html файл = 1 экземпляр
    //  filename: 'test.html',
    //  template: PATHS.dev + 'pug/test.pug',
    // }),

    new MiniCssExtractPlugin({
      filename: filename("css"),
      // path: path.resolve(__dirname, 'prod')
    }),
    new DashboardPlugin(), // подключаем красивый интерфейс к webpack
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "./src/favicon.ico"),
          to: path.resolve(__dirname, "dist"),
        },
      ],
    }),
    isProd
      ? new ImageminPlugin({
          test: /\.(png|jpe?g|gif|ico|svg)$/i,
        })
      : () => {},
  ];
  //при сбоорке на продакш запускает сервер BundleAnalyzerPlugin
  if (isProd) {
    base.push(new BundleAnalyzerPlugin());
  }

  return base;
};

module.exports = (env) => {
  const isProp = env.prop;
  if (isProp) {
    console.log(`IS PROP: ${isProp}\n`);
    console.log("Характеристика компьютера");
    console.log("========================================================");
    console.log(`Операционная система OS: ${os.platform()}\n`);
    console.log(`Архитектура процессора ARCH: ${os.arch()}\n`);
    console.log("Инфа по процессорам CPUS:\n");
    console.log(os.cpus());
    console.log(
      `Свободно памяти Free memory: ${(os.freemem() / 1024 / 1024).toFixed(
        2
      )} Mb\n`
    );
    console.log(
      `Всего памяти  Total memory: ${(
        os.totalmem() /
        1024 /
        1024 /
        1024
      ).toFixed(2)} Gb\n`
    );
    console.log(`Домашняя директория Home Dir: ${os.homedir()}\n`);
    console.log(
      `Время работы On work: ${(os.uptime() / 60 / 60).toFixed(2)} hours\n`
    );
    console.log("========================================================");
    // счетчик остановки скрипта
    setTimeout(function () {
      console.log("Остановка скрипта");
      return process.exit(1);
    }, 1000);
  }

  return {
    mode: mode,
    target: target,
    entry: {
      main: ["@babel/polyfill", "./src/main.js"],
      analytics: "@common/analytics.js",
    },
    output: {
      filename: filename("js"),
      path: path.resolve(__dirname, "dist"),
      assetModuleFilename: "images/[name][ext][query]",
      clean: true,
    },
    resolve: {
      extensions: [".js", ".json", ".png", ".xml", ".csv"], // теперь в путях не надо писать расш. вызываемых файлов
      alias: {
        "@models": path.resolve(
          __dirname,
          "src/blocks/common.blocks/common/models"
        ),
        "@common": path.resolve(__dirname, "src/blocks/common.blocks/common/"),
        "@": path.resolve(__dirname, "src"),
      },
    },

    module: {
      rules: [
        {
          test: /\.css$/,
          use: cssLoaders(),
        },
        {
          test: /\.pug$/,
          loader: "pug-loader",
          options: {
            pretty: isDev,
          },
        },
        {
          test: /\.(png|jpe?g|svg|gif|ico)$/i,
          type: "asset",
        },
        {
          test: /\.(eot|otf|ttf|woff|woff2)$/,
          type: "asset/resource",
          generator: {
            filename: "fonts/[name][ext][query]",
          },
        },
        {
          test: /\.(s[ac]|c)ss$/,
          use: cssLoaders("sass-loader"),
        },
        {
          test: /\.xml$/,
          use: ["xml-loader"],
        },
        {
          test: /\.csv$/,
          use: ["csv-loader"],
        },
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: "babel-loader",
          options: {
            plugins: ["@babel/plugin-proposal-class-properties"],
          },
        },
      ],
    },

    plugins: plugins(),

    optimization: optimization(),
    devtool: isDev ? "source-map" : false,
    devServer: {
      port: 8080,
      static: "./dist",
      hot: true,
    },
  };
};
