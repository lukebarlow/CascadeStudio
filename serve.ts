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
    
    // Serve files from dist directory
    const file = Bun.file(`./dist${filePath}`);
    
    if (await file.exists()) {
      return new Response(file);
    }
    
    // Return 404 for missing files
    return new Response("Not Found", { status: 404 });
  },
});

console.log(`Server running at http://localhost:${server.port}`);
