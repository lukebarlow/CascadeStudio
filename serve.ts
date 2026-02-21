#!/usr/bin/env bun

const server = Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);
    let filePath = url.pathname;
    
    // Default to index.html for root
    if (filePath === "/") {
      filePath = "/index.html";
    }

    // Basic path traversal guard
    if (filePath.includes("..")) {
      return new Response("Not Found", { status: 404 });
    }
    
    // Serve files from dist directory
    const file = Bun.file(`./dist${filePath}`);
    
    if (await file.exists()) {
      return new Response(file);
    }

    // Allow direct access to local node_modules assets (e.g. Monaco extra libs)
    if (filePath.startsWith("/node_modules/")) {
      const moduleFile = Bun.file(`.${filePath}`);
      if (await moduleFile.exists()) {
        return new Response(moduleFile);
      }
    }

    // Allow direct access to local JS assets not copied into dist
    if (filePath.startsWith("/js/")) {
      const jsFile = Bun.file(`.${filePath}`);
      if (await jsFile.exists()) {
        return new Response(jsFile);
      }
    }
    
    // Return 404 for missing files
    return new Response("Not Found", { status: 404 });
  },
});

console.log(`Server running at http://localhost:${server.port}`);
