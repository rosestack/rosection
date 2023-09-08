import { defineRoserepo, Runner, Cache } from "roserepo";

export default defineRoserepo({
  root: true,
  monorepo: {
    runner: {
      dev: Runner.many({
        parallel: true,
      }),
      build: Runner.pipeline({
        parallel: true,
        throwOnError: true,
        dependencyScript: "build",
        cache: Cache.file({
          include: [
            "package.json",
            "tsconfig.json",
            "source/**/*",
            "lib/**/*",
            "dist/**/*",
          ],
        }),
      }),
      test: Runner.many({
        parallel: false,
        throwOnError: true,
      }),
      lint: Runner.many({
        parallel: true,
        throwOnError: true,
      }),
    },
  },
});