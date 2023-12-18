import {defineRosepack} from "rosepack";

export default defineRosepack((config) => ({
  clean: config.mode === "production",
  format: [
    "esm",
    "cjs",
    "dts",
  ],
  createEnv: true,
  defineRuntime: {
    version: true,
  },
  input: {
    main: "source/main.ts",
  },
}));