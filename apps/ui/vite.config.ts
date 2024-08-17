/// <reference types='vitest' />

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { nxViteTsPaths } from "@nx/vite/plugins/nx-tsconfig-paths.plugin";
import path from "path";

export default defineConfig({
  root: __dirname,
  cacheDir: "../../node_modules/.vite/apps/ui",
  resolve: {
    alias: {
      common: path.resolve(__dirname, "src", "common"),
    },
  },

  server: {
    port: 5173,
    host: "localhost",
  },

  preview: {
    port: 5173,
    host: "localhost",
  },

  plugins: [react(), nxViteTsPaths()],

  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },

  test: {
    globals: true,
    testTimeout: 25000,
    environment: "jsdom",
    setupFiles: "./src/common/test-setup.js",
    resolveSnapshotPath: (testPath, snapshotExtension) =>
      testPath.replace(/^.*[\\/]/, "./__snapshots__/") + snapshotExtension,
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"], // lcov to create lcov.info
      reportsDirectory: "coverage",
      enabled: true,
    },
  },

  envPrefix: "CBST_",

  build: {
    outDir: "../../dist/apps/ui",
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
});
