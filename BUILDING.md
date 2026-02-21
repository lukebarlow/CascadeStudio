# Building and Running CascadeStudio with Bun

This project uses [Bun](https://bun.sh) for bundling dependencies and serving the application during development.

## Prerequisites

- [Bun](https://bun.sh) installed on your system

## Installation

Install dependencies:

```bash
bun install
# or use npm
npm install
```

## Development

### Build the application

```bash
bun run build
```

This will:
- Bundle JavaScript dependencies (three.js, jquery, tweakpane) into `dist/js/main.js`
- Copy static assets (CSS, fonts, icons, textures) to `dist/`
- Copy worker files and Monaco Editor assets
- Copy vendored libraries from `vendor/`

### Serve the application locally

```bash
bun run serve
```

The application will be available at http://localhost:3000

### Build and serve

```bash
bun run dev
```

## Project Structure

- `src/main.ts` - Entry point that bundles npm dependencies
- `build.ts` - Build script using Bun.build()
- `serve.ts` - Development server using Bun.serve()
- `vendor/` - Custom/vendored libraries not available on npm:
  - `opencascade.js/` - Custom OpenCascade WASM build
  - `rawflate/` - Compression libraries
  - `opentype.js/` - Font parsing library
  - `potpack/` - Texture atlas packing
- `js/` - Original application JavaScript files
- `dist/` - Build output (not committed to git)

## Notes

- The CAD worker (`js/CADWorker/`) uses `importScripts()` and cannot be bundled as an ES module
- GoldenLayout is loaded via a script tag due to AMD/RequireJS conflicts with Monaco Editor
- Monaco Editor assets are copied to maintain the RequireJS-based module loading
