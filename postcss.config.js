export default {
  plugins: {
    "postcss-preset-mantine": {},
    "@recursica/recursica-postcss-vars": {
      cssPath: "./recursica_variables_scoped.css",
      strict: process.env.NODE_ENV === "production",
    },
  },
};
