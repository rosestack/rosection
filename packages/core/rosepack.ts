import { defineRosepack } from "rosepack";

export default defineRosepack((config) => ({
  defineRuntime: {
    version: true,
  },
  output: {
    format: [
      "esm",
      "cjs",
    ],
  },
  clean: config.mode === "production",
  declaration: true,
}));