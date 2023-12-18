declare var __VERSION__: string;
declare var __MODE__: "development" | "production";
declare var __DEV__: boolean;
declare var __PROD__: boolean;

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly VERSION: string;
      readonly NODE_ENV: "development" | "production";
    }
  }
}