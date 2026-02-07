import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  outDir: "dist",
  format: ["cjs"],
  platform: "node",
  target: "node20",
  sourcemap: true,
  clean: true,
  splitting: false,

  // ✅ IMPORTANT: do NOT bundle prisma
  external: [
    "@prisma/client",
    "prisma",
    "@prisma/client-runtime-utils",
    "pg",
    "pg-native",
  ],
});
