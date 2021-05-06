require("dotenv").config();
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");

module.exports = {
  mount: {
    public: "/",
    src: "/_dist_",
  },
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
