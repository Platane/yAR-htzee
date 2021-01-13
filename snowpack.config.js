require("dotenv").config();

module.exports = {
  mount: {
    public: "/",
    src: "/_dist_",
  },
  plugins: [
    //
    "@snowpack/plugin-typescript",
  ],
  devOptions: { secure: true },
};
