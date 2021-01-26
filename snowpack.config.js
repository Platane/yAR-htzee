require("dotenv").config();

module.exports = {
  mount: {
    public: "/",
    src: "/_dist_",
  },
  plugins: [
    //
    "@snowpack/plugin-typescript",

    // [
    //   "@snowpack/plugin-webpack",
    //   {
    //     extendConfig: (config) => {
    //       // config.target = "node";

    //       // config.optimization.splitChunks.maxSize = 2000000;

    //       // config.optimization.splitChunks.cacheGroups = undefined;
    //       // config.optimization.minimizer = undefined;

    //       config.output.publicPath = "";
    //       config.output.filename = "[id]-[contentHash:4].js";

    //       // config.output.libraryTarget = "commonjs";
    //       // config.output.library = "aaaa";

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

  optimize: {
    bundle: true,
    minify: true,
    splitting: true,
    treeshake: true,
    target: "es2018",
  },
};
