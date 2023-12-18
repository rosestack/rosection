import { defineRosepack } from "rosepack";

export default defineRosepack({
  mode: "development",
  external: ["rosection", "reflect-metadata"],
  entry: "source/index.ts",
  clean: true,
});