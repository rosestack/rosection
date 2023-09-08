import { defineRosepack } from "rosepack";

export default defineRosepack({
  defineRuntime: {
    version: true,
  },
  output: {
    format: [
      "esm",
      "cjs"
    ],
  },
  declaration: true,
  clean: true,
});