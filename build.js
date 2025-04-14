// build.js
const esbuild = require("esbuild");
const { copy } = require("esbuild-plugin-copy");

esbuild
  .build({
    entryPoints: ["index.ts"],
    bundle: false,
    outdir: "dist",
    platform: "node",
    target: "node16",
    format: "cjs", // CommonJS output
    sourcemap: true,
    loader: { ".ts": "ts" }, // Ensure TypeScript files are handled correctly
    banner: {
      js: "/* CommonJS module */", // Hint to Node.js
    },
    plugins: [
      copy({
        assets: {
          from: ["public/**/*"],
          to: ["public"],
        },
      }),
    ],
  })
  .catch(() => process.exit(1));