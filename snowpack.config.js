require("dotenv").config();

module.exports = {
  mount: {
    public: "/",
    src: "/_dist_",
  },
  plugins: [
    //
    "@snowpack/plugin-typescript",

    "@snowpack/plugin-webpack",

    [
      "snowpack-plugin-replace",
      {
        list: [
          {
            from: "process.env.XR8_API_KEY",
            to: JSON.stringify(process.env.XR8_API_KEY),
          },
        ],
      },
    ],
  ],

  devOptions: { secure: true },

  optimize: {
    bundle: true,
    minify: false,
    target: "es2018",
  },
};
