import path from "node:path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    // The RLS suite talks to the real project, so it needs the same env the app
    // uses. Unit tests ignore it.
    setupFiles: ["tests/setup-env.ts"],
    // RLS tests sign in and mutate subscription status; running files in
    // parallel would have them stepping on each other.
    fileParallelism: false,
    testTimeout: 30_000,
  },
});
