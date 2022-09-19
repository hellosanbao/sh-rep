import path from "path";
import commonjs from "@rollup/plugin-commonjs";
import babel from "@rollup/plugin-babel";
import ts from "rollup-plugin-typescript2";
import json from "@rollup/plugin-json";
import { nodeResolve } from "@rollup/plugin-node-resolve";

const resolve = (p) => path.resolve(__dirname, p);

export default {
  input: resolve("./src/index.ts"),
  output: [
    {
      exports: "named",
      file: resolve("./dist/index.js"),
      format: "cjs",
      name: "super-poster",
    },
  ],
  plugins: [
    json(),
    ts(),
    commonjs(),
    nodeResolve(),
    babel({
      babelHelpers: "runtime",
      exclude: "node_modules/**",
      presets: [["@babel/preset-env"]],
    }),
  ],
};
