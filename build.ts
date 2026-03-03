#!/usr/bin/env bun

import { copyFileSync, cpSync, existsSync, mkdirSync, readdirSync, rmSync } from "fs";
import { join } from "path";

// Helper to transpile a .ts file to .js in the dest directory
async function transpileDir(srcDir: string, destDir: string) {
  const transpiler = new Bun.Transpiler({ loader: "ts" });
  if (!existsSync(srcDir)) return;
  mkdirSync(destDir, { recursive: true });
  const files = readdirSync(srcDir);
  for (const file of files) {
    const srcPath = join(srcDir, file);
    if (file.endsWith(".ts")) {
      const tsSource = await Bun.file(srcPath).text();
      const jsOutput = transpiler.transformSync(tsSource);
      const destFile = file.replace(/\.ts$/, ".js");
      await Bun.write(join(destDir, destFile), jsOutput);
    } else if (!file.endsWith(".js")) {
      copyFileSync(srcPath, join(destDir, file));
    }
  }
}

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

// Copy worker files directly (they use importScripts and can't be bundled as ES modules)
const workerDir = "./js/CADWorker";
const workerDest = "./dist/js/CADWorker";
await transpileDir(workerDir, workerDest);

// Copy MainPage JS files directly (they define global functions)
const mainPageDir = "./js/MainPage";
const mainPageDest = "./dist/js/MainPage";
await transpileDir(mainPageDir, mainPageDest);

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

// Copy Golden Layout CSS and JS
const glCssSrc = "./node_modules/golden-layout/src/css";
const glCssDest = "./dist/node_modules/golden-layout/src/css";
if (existsSync(glCssSrc)) {
  cpSync(glCssSrc, glCssDest, { recursive: true });
}
const glJsSrc = "./node_modules/golden-layout/dist";
const glJsDest = "./dist/node_modules/golden-layout/dist";
if (existsSync(glJsSrc)) {
  cpSync(glJsSrc, glJsDest, { recursive: true });
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

// Copy three.js for the worker
const threeSrc = "./node_modules/three/build/three.min.js";
const threeDest = "./dist/node_modules/three/build/three.min.js";
if (existsSync(threeSrc)) {
  mkdirSync(join(distDir, "node_modules/three/build"), { recursive: true });
  copyFileSync(threeSrc, threeDest);
}

console.log("Build complete!");
