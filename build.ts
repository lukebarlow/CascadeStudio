#!/usr/bin/env bun

import { copyFileSync, cpSync, existsSync, mkdirSync, rmSync } from "fs";
import { join } from "path";

const distDir = "./dist";

// Clean dist directory
if (existsSync(distDir)) {
  rmSync(distDir, { recursive: true });
}
mkdirSync(distDir, { recursive: true });

console.log("Building CascadeStudio with Bun...");

// Bundle the main application JavaScript
await Bun.build({
  entrypoints: ["./src/main.ts"],
  outdir: "./dist/js",
  target: "browser",
  minify: false,
  sourcemap: "external",
  naming: {
    entry: "main.js",
  },
});

// Bundle the CAD Worker
await Bun.build({
  entrypoints: ["./src/worker.ts"],
  outdir: "./dist/js",
  target: "browser",
  minify: false,
  sourcemap: "external",
  naming: {
    entry: "worker.js",
  },
});

// Copy static assets
const staticDirs = ["css", "fonts", "icon", "textures"];
for (const dir of staticDirs) {
  if (existsSync(dir)) {
    cpSync(dir, join(distDir, dir), { recursive: true });
  }
}

// Copy static files
const staticFiles = [
  "index.html",
  "manifest.webmanifest",
  "service-worker.js",
  ".nojekyll",
];
for (const file of staticFiles) {
  if (existsSync(file)) {
    copyFileSync(file, join(distDir, file));
  }
}

// Copy Monaco Editor assets (needed for editor to work)
const monacoSrc = "./node_modules/monaco-editor/min/vs";
const monacoDest = "./dist/node_modules/monaco-editor/min/vs";
if (existsSync(monacoSrc)) {
  cpSync(monacoSrc, monacoDest, { recursive: true });
}

// Copy OpenCascade.js WASM files (custom build from vendor)
const ocSrc = "./vendor/opencascade.js/dist";
const ocDest = "./dist/vendor/opencascade.js/dist";
if (existsSync(ocSrc)) {
  cpSync(ocSrc, ocDest, { recursive: true });
}

// Copy Golden Layout CSS
const glCssSrc = "./node_modules/golden-layout/src/css";
const glCssDest = "./dist/node_modules/golden-layout/src/css";
if (existsSync(glCssSrc)) {
  cpSync(glCssSrc, glCssDest, { recursive: true });
}

// Copy vendored libraries (rawflate, opentype.js, potpack) - these are custom/vendored
const vendoredLibs = ["rawflate", "opentype.js", "potpack"];
for (const lib of vendoredLibs) {
  const libSrc = `./vendor/${lib}`;
  const libDest = `./dist/vendor/${lib}`;
  if (existsSync(libSrc)) {
    cpSync(libSrc, libDest, { recursive: true });
  }
}

console.log("Build complete!");
