require("dotenv").config();
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const { visualizer } = require("rollup-plugin-visualizer");

module.exports = {
  mount: {
    public: "/",
    src: "/_dist_",
  },

  // alias: {
  //   "three/examples/js/libs/stats.min": "three/examples/js/libs/stats.min",
  //   three: __dirname + "/node_modules/three/src/Three.js",
  // },

  plugins: [
    //
    "@snowpack/plugin-typescript",

    [
      "@snowpack/plugin-webpack",
      {
        extendConfig: (config) => {
          config.plugins.push(
            new BundleAnalyzerPlugin({
              analyzerMode: "static",
              openAnalyzer: false,
            })
          );

          return config;
        },
      },
    ],

    // [
    //   "snowpack-plugin-rollup-bundle",
    //   {
    //     entrypoints: "build/_dist_/index.js",
    //     emitHtmlFiles: true,
    //     extendConfig: (config) => {
    //       config.inputOptions.plugins.push(
    //         visualizer({ template: "treemap", filename: "build/report.html" })
    //       );
    //       return config;
    //     },
    //   },
    // ],

    [
      "snowpack-plugin-replace",
      {
        list: [
          {
            from: "process.env.XR8_API_KEY",
            to: JSON.stringify(process.env.XR8_API_KEY || ""),
          },
        ],
      },
    ],
  ],

  devOptions: { secure: true },
};
