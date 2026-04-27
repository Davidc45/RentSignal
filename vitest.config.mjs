import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["**/*.{test,spec}.js"],
    exclude: ["node_modules", ".next", "out"],
    // Intentionally no loadEnv / .env.local merge: unit tests must not depend on local secrets.
  },
});
